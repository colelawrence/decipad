/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import type {
  AST,
  Unit,
  Value as ValueTypes,
} from '@decipad/language-interfaces';
import DeciNumber, { min, max, ZERO } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  RuntimeError,
  Value,
  convertBetweenUnits,
} from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { getIdentifierString } from '@decipad/language-utils';
import { evaluate } from '../interpreter';
import { predicateSymbols } from './inferTiered';
import { cleanInferred } from './cleanInferred';
import { getDefined, getInstanceof } from '@decipad/utils';
import { withPush, type TRealm } from '../scopedRealm';
import { prettyPrintAST } from '../parser/utils';

const maybeConvertBetweenUnits = (
  f: DeciNumber,
  from: Unit[] | null,
  to: Unit[] | null
) => {
  if (!from || !to) {
    return f;
  }
  return convertBetweenUnits(f, from, to);
};

interface Predicates {
  max?: AST.Expression;
  min?: AST.Expression;
  rest?: AST.Expression;
}

type Tier = [AST.Expression, AST.Expression];

const getPredicate = (exp: AST.Expression): keyof Predicates | undefined => {
  const id = exp.type === 'ref' && getIdentifierString(exp);
  if (id && predicateSymbols.has(id)) {
    return id as keyof Predicates;
  }
  return undefined;
};

const collectTieredDef = (
  def: AST.TieredDef
): [AST.Expression | keyof Predicates, AST.Expression] => {
  const [predicateOrTier, result] = def.args;
  const predicate = getPredicate(predicateOrTier);
  if (predicate) {
    return [predicate, result];
  }
  return [predicateOrTier, result];
};

const collectDefs = (tierDefs: AST.TieredDef[]) => {
  const predicates: Predicates = {};
  const tiers: Array<Tier> = [];

  // collect defs
  for (const tierDef of tierDefs) {
    const [predicateOrTierSizeExp, predicateOrTierValueExp] =
      collectTieredDef(tierDef);
    if (typeof predicateOrTierSizeExp === 'string') {
      predicates[predicateOrTierSizeExp] = predicateOrTierValueExp;
    } else {
      tiers.push([predicateOrTierSizeExp, predicateOrTierValueExp]);
    }
  }

  return { predicates, tiers };
};

const evaluateTier = async (
  _realm: TRealm,
  tierValueExp: AST.Expression,
  tierSize: DeciNumber,
  tierResultType: Type
): Promise<DeciNumber> =>
  withPush(
    _realm,
    async (realm) => {
      const tierValueType = cleanInferred(
        getDefined(tierValueExp.inferredType)
      );
      const tierSizeValue = Value.NumberValue.fromValue(tierSize);
      realm.stack.set('tier', tierSizeValue);
      realm.stack.set('slice', tierSizeValue);
      const tierValue = await evaluate(realm, tierValueExp);
      return maybeConvertBetweenUnits(
        getInstanceof(await tierValue.getData(), DeciNumber),
        tierValueType.unit,
        tierResultType.unit
      );
    },
    `evaluate tier ${prettyPrintAST(tierValueExp)}`
  );

interface IterateTierResult {
  slice: DeciNumber;
  tierResult: DeciNumber;
  tierCutOff: DeciNumber;
}

const iterateTier = async (
  realm: TRealm,
  globalTierSizeType: Type,
  tierResultType: Type,
  tier: Tier,
  tierIndex: number,
  remaining: DeciNumber,
  previousCutoff: DeciNumber
): Promise<IterateTierResult> => {
  const [tierSizeExp, tierValueExp] = tier;
  const tierSizeType = getDefined(tierSizeExp.inferredType);

  const tierCutOff = maybeConvertBetweenUnits(
    await getInstanceof(
      await (await evaluate(realm, tierSizeExp)).getData(),
      DeciNumber
    ),
    tierSizeType.unit,
    globalTierSizeType.unit
  );
  const tierSize = tierCutOff.sub(previousCutoff);
  if (tierSize.compare(ZERO) < 0) {
    throw new RuntimeError(
      `Error on tier definition number ${tierIndex}. Each tier level needs to be bigger than the previous one`
    );
  }
  const slice = min(remaining, tierSize);
  const tierResult = await evaluateTier(
    realm,
    tierValueExp,
    slice,
    tierResultType
  );

  return { tierResult, slice, tierCutOff };
};

export const evaluateTiered = async (
  realm: TRealm,
  node: AST.Tiered
): Promise<ValueTypes.Value> => {
  const [initial, ...tierDefs] = node.args;
  const initialNumber = getInstanceof(
    await (await evaluate(realm, initial)).getData(),
    DeciNumber
  );
  const tierSizeType = getDefined(initial.inferredType);
  const resultType = getDefined(node.inferredType);

  const { predicates, tiers } = collectDefs(tierDefs);

  // evaluate
  let remaining = initialNumber;
  let acc = ZERO;
  let previousCutoff = ZERO;
  let tierIndex = 0;
  while (remaining.compare(ZERO) > 0 && tiers.length) {
    tierIndex += 1;
    const tier = tiers.shift();
    if (tier) {
      const { slice, tierResult, tierCutOff } = await iterateTier(
        realm,
        tierSizeType,
        resultType,
        tier,
        tierIndex,
        remaining,
        previousCutoff
      );
      acc = acc.add(tierResult);
      remaining = remaining.sub(slice);
      previousCutoff = tierCutOff;
    }
  }

  if (remaining.compare(ZERO) > 0) {
    const { rest } = predicates;
    if (rest) {
      const restValue = await evaluateTier(realm, rest, remaining, resultType);
      acc = acc.add(restValue);
    }
  }

  if (predicates.min) {
    const minType = getDefined(predicates.min.inferredType);
    const minimumValue = maybeConvertBetweenUnits(
      getInstanceof(
        await (await evaluate(realm, predicates.min)).getData(),
        DeciNumber
      ),
      minType.unit,
      resultType.unit
    );
    acc = max(acc, minimumValue);
  }

  if (predicates.max) {
    const maxType = getDefined(predicates.max.inferredType);
    const maximumValue = maybeConvertBetweenUnits(
      getInstanceof(
        await (await evaluate(realm, predicates.max)).getData(),
        DeciNumber
      ),
      maxType.unit,
      resultType.unit
    );
    acc = min(acc, maximumValue);
  }

  return Value.NumberValue.fromValue(acc);
};
