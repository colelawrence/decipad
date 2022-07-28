/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import FFraction, { min, max, ZERO } from '@decipad/fraction';
import {
  evaluate,
  FractionValue,
  Realm,
  RuntimeError,
  Value,
} from '../interpreter';
import { AST } from '../parser';
import { getIdentifierString, getInstanceof } from '../utils';
import { predicateSymbols } from './inferTiered';

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

const evaluateTier = async (
  realm: Realm,
  tierValueExp: AST.Expression,
  tierSize: FFraction
): Promise<FFraction> => {
  return realm.stack.withPush(async () => {
    const tierSizeValue = FractionValue.fromValue(tierSize);
    realm.stack.set('tier', tierSizeValue);
    realm.stack.set('slice', tierSizeValue);
    return getInstanceof(
      (await evaluate(realm, tierValueExp)).getData(),
      FFraction
    );
  });
};

export const evaluateTiered = async (
  realm: Realm,
  node: AST.Tiered
): Promise<Value> => {
  const [initial, ...tierDefs] = node.args;
  const initialNumber = getInstanceof(
    (await evaluate(realm, initial)).getData(),
    FFraction
  );
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

  // evaluate
  let remaining = initialNumber;
  let acc = ZERO;
  let previousCutoff = ZERO;
  let tierIndex = 0;
  while (remaining.compare(ZERO) > 0 && tiers.length) {
    tierIndex += 1;
    const tier = tiers.shift();
    if (tier) {
      const [tierSizeExp, tierValueExp] = tier;
      const tierCutOff = getInstanceof(
        (await evaluate(realm, tierSizeExp)).getData(),
        FFraction
      );
      const tierSize = tierCutOff.sub(previousCutoff);
      if (tierSize.compare(ZERO) < 0) {
        throw new RuntimeError(
          `Error on tier definition number ${tierIndex}. Each tier level needs to be bigger than the previous one`
        );
      }
      const slice = min(remaining, tierSize);
      const tierResult = await evaluateTier(realm, tierValueExp, slice);
      acc = acc.add(tierResult);
      remaining = remaining.sub(slice);
      previousCutoff = tierCutOff;
    }
  }

  if (remaining.compare(ZERO) > 0) {
    const { rest } = predicates;
    if (rest) {
      const restValue = await evaluateTier(realm, rest, remaining);
      acc = acc.add(restValue);
    }
  }

  if (predicates.min) {
    const minimumValue = getInstanceof(
      (await evaluate(realm, predicates.min)).getData(),
      FFraction
    );
    acc = max(acc, minimumValue);
  }

  if (predicates.max) {
    const maximumValue = getInstanceof(
      (await evaluate(realm, predicates.max)).getData(),
      FFraction
    );
    acc = min(acc, maximumValue);
  }

  return FractionValue.fromValue(acc);
};
