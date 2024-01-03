import { Type } from '../Type/Type';

export type IndexNames = (string | null)[];

export const arrayOfOnes = (length: number) => Array.from({ length }, () => 1);

export const getCardinality = (type: Type): number => {
  if (type.cellType != null) {
    return 1 + getCardinality(type.cellType);
  } else {
    return 1;
  }
};

export const findInvalidCardinality = (
  args: Type[],
  expectedCardinalities: number[]
) => args.find((arg, i) => getCardinality(arg) < expectedCardinalities[i]);
