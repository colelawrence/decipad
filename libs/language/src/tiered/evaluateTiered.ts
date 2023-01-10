/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import DeciNumber, { min, max, ZERO } from '@decipad/number';
import { NumberValue, Value } from '../value';
import { evaluate, Realm, RuntimeError } from '../interpreter';
import { AST } from '../parser';
import { Type, Unit } from '../type';
import { convertBetweenUnits } from '../units';
import { getDefined, getIdentifierString, getInstanceof } from '../utils';
import { predicateSymbols } from './inferTiered';

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
  realm: Realm,
  tierValueExp: AST.Expression,
  tierSize: DeciNumber,
  tierResultType: Type
): Promise<DeciNumber> => {
  const tierValueType = getDefined(
    realm.inferContext.nodeTypes.get(tierValueExp)
  );
  const tierSizeValue = NumberValue.fromValue(tierSize);
  const tierValue = await realm.stack.withPush(async () => {
    realm.stack.set('tier', tierSizeValue);
    realm.stack.set('slice', tierSizeValue);
    return evaluate(realm, tierValueExp);
  });
  return maybeConvertBetweenUnits(
    getInstanceof(tierValue.getData(), DeciNumber),
    tierValueType.unit,
    tierResultType.unit
  );
};

interface IterateTierResult {
  slice: DeciNumber;
  tierResult: DeciNumber;
  tierCutOff: DeciNumber;
}

const iterateTier = async (
  realm: Realm,
  globalTierSizeType: Type,
  tierResultType: Type,
  tier: Tier,
  tierIndex: number,
  remaining: DeciNumber,
  previousCutoff: DeciNumber
): Promise<IterateTierResult> => {
  const [tierSizeExp, tierValueExp] = tier;
  const tierSizeType = getDefined(
    realm.inferContext.nodeTypes.get(tierSizeExp)
  );

  const tierCutOff = maybeConvertBetweenUnits(
    getInstanceof((await evaluate(realm, tierSizeExp)).getData(), DeciNumber),
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
  realm: Realm,
  node: AST.Tiered
): Promise<Value> => {
  const [initial, ...tierDefs] = node.args;
  const initialNumber = getInstanceof(
    (await evaluate(realm, initial)).getData(),
    DeciNumber
  );
  const tierSizeType = getDefined(realm.inferContext.nodeTypes.get(initial));
  const resultType = getDefined(realm.inferContext.nodeTypes.get(node));

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
    const minType = getDefined(
      realm.inferContext.nodeTypes.get(predicates.min)
    );
    const minimumValue = maybeConvertBetweenUnits(
      getInstanceof(
        (await evaluate(realm, predicates.min)).getData(),
        DeciNumber
      ),
      minType.unit,
      resultType.unit
    );
    acc = max(acc, minimumValue);
  }

  if (predicates.max) {
    const maxType = getDefined(
      realm.inferContext.nodeTypes.get(predicates.max)
    );
    const maximumValue = maybeConvertBetweenUnits(
      getInstanceof(
        (await evaluate(realm, predicates.max)).getData(),
        DeciNumber
      ),
      maxType.unit,
      resultType.unit
    );
    acc = min(acc, maximumValue);
  }

  return NumberValue.fromValue(acc);
};
