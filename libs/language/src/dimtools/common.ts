import type { Type } from '../type';

export type IndexNames = (string | null)[];

export const someTrue = (bools: boolean[]) => bools.some((b) => b === true);

export const arrayOfOnes = (length: number) => Array.from({ length }, () => 1);

export const validateCardinalities = <T extends { cardinality: number }>(
  args: T[],
  expectedCardinalities: number[]
) => args.every((arg, i) => arg.cardinality >= expectedCardinalities[i]);

export const compareDimensions = (a: Type, b: Type) => {
  if (a.columnSize != null && b.columnSize != null) {
    return a.columnSize === 'unknown' || b.columnSize === 'unknown'
      ? true
      : a.columnSize === b.columnSize;
  }

  return false;
};
