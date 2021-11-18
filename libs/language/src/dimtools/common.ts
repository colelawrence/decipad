import { produce } from 'immer';
import { equalOrUnknown } from '../utils';
import { Type } from '../type';

export type IndexNames = (string | null)[];

export const arrayOfOnes = (length: number) => Array.from({ length }, () => 1);

export const getCardinality = (type: Type): number => {
  if (type.cellType != null) {
    return 1 + getCardinality(type.cellType);
  } else {
    return 1;
  }
};

export const validateCardinalities = (
  args: Type[],
  expectedCardinalities: number[]
) => args.every((arg, i) => getCardinality(arg) >= expectedCardinalities[i]);

export const compareDimensions = (a: Type, b: Type) => {
  if (a.columnSize != null && b.columnSize != null) {
    return equalOrUnknown(a.columnSize, b.columnSize);
  }

  return false;
};

export const linearizeType = (type: Type): Type[] =>
  type.cellType ? [type, ...linearizeType(type.cellType)] : [type];

export const deLinearizeType = (types: Type[]): Type =>
  Type.combine(...types).mapType(() =>
    types.length === 1
      ? types[0]
      : produce(types[0], (type) => {
          type.cellType = deLinearizeType(types.slice(1));
        })
  );
