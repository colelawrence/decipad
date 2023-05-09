import { Type } from '../type';
import { enumerate } from '../utils';
import { getCardinality, IndexNames } from './common';

const isColumn = (arg: Type) => arg.cellType != null;

/** Get all the indices in this column */
const getIndexNames = (t: Type): IndexNames => {
  if (t.cellType) {
    return [t.indexedBy, ...getIndexNames(t.cellType)];
  } else {
    return [];
  }
};

const findCommonIndexBetweenArguments = <T>(
  argIndices: T[][],
  highCardinality: boolean[],
  exclude = new Set<T>()
): T | null => {
  const seen = new Set();

  for (const [index, arg] of enumerate(argIndices)) {
    if (!highCardinality[index]) continue;

    for (const indexName of arg) {
      if (indexName != null) {
        if (seen.has(indexName) && !exclude.has(indexName)) {
          return indexName;
        }
        seen.add(indexName);
      }
    }
  }

  return null;
};

const findAnyIndex = (
  argIndices: IndexNames[],
  highCardinality: boolean[]
): string | undefined => {
  for (const [index, arg] of enumerate(argIndices)) {
    if (!highCardinality[index]) continue;

    for (const indexName of arg) {
      if (
        typeof indexName === 'string' &&
        !(!indexName.startsWith || indexName.startsWith('\0'))
      ) {
        return indexName;
      }
    }
  }

  return undefined;
};

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
export const getReductionPlan = (
  args: Type[],
  wantedCardinalities: number[]
): boolean[] => {
  /** Given an arg index, does it have more dimensions than wantedCardinalities? */
  const highCardinality = args.map(
    (arg, i) => isColumn(arg) && getCardinality(arg) > wantedCardinalities[i]
  );

  const argIndices = args.map(getIndexNames);
  const commonIndex = findCommonIndexBetweenArguments(
    argIndices,
    highCardinality
  );
  if (commonIndex) {
    return argIndices.map(
      (indices, i) => indices.includes(commonIndex) && highCardinality[i]
    );
  }

  // Expand dims when any named index is spotted
  const namedIndex = findAnyIndex(argIndices, highCardinality);
  if (namedIndex != null) {
    return argIndices.map(
      (indexName, i) => indexName.includes(namedIndex) && highCardinality[i]
    );
  }

  // Iterate all unnamed higher-cardinality columns at once
  return highCardinality;
};
