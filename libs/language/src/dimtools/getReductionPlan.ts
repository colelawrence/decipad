import * as Value from '../interpreter/Value';
import { Type } from '../type';
import { IndexNames, someTrue } from './common';

export const dimensionForProduct = (
  indexNames: IndexNames,
  whichToReduce: boolean[]
) => indexNames.find((name, index) => name != null && whichToReduce[index]);

export const removeDimensionName = (indexNames: IndexNames, dim: string) =>
  indexNames.map((x) => (x === dim ? null : x));

const getFirstToReduce = <T>(whichToReduce: boolean[], items: T[]): T | null =>
  items[whichToReduce.indexOf(true)] ?? null;

const isColumn = (arg: Value.Value | Type) =>
  arg instanceof Type ? arg.cellType != null : arg instanceof Value.Column;

/**
 * Given a call with higher-dimension arguments, which dimension are we going
 * through first?
 *
 * This is based on indices, and on whether the function we're calling has
 * lower-dimension arguments than the arguments we have for it.
 *
 * Does not find all the reductions -- once this reduction is eliminated
 * (below in the recursion stack), further calls to getReductionPlan will find
 * where to reduce next.
 */
export const getReductionPlan = <Arg extends Value.Value | Type>(
  args: Arg[],
  targetCardinalities: number[],
  indexNames: IndexNames
) => {
  let whichToReduce = args.map(
    (arg, i) => isColumn(arg) && arg.cardinality > targetCardinalities[i]
  );

  if (!someTrue(whichToReduce)) {
    return { whichToReduce, firstToReduce: null };
  }

  const differentDimension = indexNames.find(
    (indexName, index) => indexName != null && whichToReduce[index]
  );
  if (differentDimension) {
    whichToReduce = indexNames.map(
      (indexName, i) => indexName === differentDimension && whichToReduce[i]
    );
  }

  return {
    whichToReduce,
    firstToReduce: getFirstToReduce(whichToReduce, args),
  };
};
