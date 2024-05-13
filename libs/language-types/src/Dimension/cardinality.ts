import { dequal } from '@decipad/utils';
import type { Type } from '../Type/Type';
import uniq from 'lodash.uniq';

export type IndexNames = (string | null)[];

export const arrayOfOnes = (length: number) => Array.from({ length }, () => 1);

export const getCardinality = (type: Type): number => {
  if (type.cellType != null) {
    return 1 + getCardinality(type.cellType);
  } else {
    return 1;
  }
};

const getIndexNames = (t: Type): IndexNames => {
  if (t.cellType) {
    return [t.indexedBy, ...getIndexNames(t.cellType)];
  } else {
    return [];
  }
};
const findMaxCardinalities = (args: Type[]): number[] => {
  const cardinalities = args.map(getCardinality);
  const usedIndexNames = (
    args.map(getIndexNames).filter(Boolean) as string[][]
  ).map((indexNames) => uniq(indexNames.filter(Boolean)).sort());
  if (usedIndexNames.length === 0) {
    return cardinalities;
  }

  // if any of the index names are different, we can only return an array of ones
  const ref = usedIndexNames[0];
  if (usedIndexNames.slice(1).some((indexNames) => !dequal(indexNames, ref))) {
    return arrayOfOnes(args.length);
  }
  return cardinalities;
};

export const findFirstValidCardinality = (
  args: Type[],
  availableCardinalities: Array<number[]>
) => {
  const maxCardinalities = findMaxCardinalities(args);
  return availableCardinalities.find((availableCardinality) =>
    args.find((_, i) => {
      return availableCardinality[i] <= maxCardinalities[i];
    })
  );
};

export const findFirstInValidCardinality = (
  args: Type[],
  availableCardinalities: Array<number[]>
) => {
  const maxCardinalities = findMaxCardinalities(args);
  return args.find((_, i) =>
    availableCardinalities.find(
      (availableCardinality) => availableCardinality[i] > maxCardinalities[i]
    )
  );
};
