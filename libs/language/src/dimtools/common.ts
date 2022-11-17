import { produce } from 'immer';
import { equalOrUnknown } from '../utils';
import { Type } from '../type';
import { DimensionId } from '../lazy';

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

export const compareDimensions = (a: Type, b: Type) => {
  if (a.columnSize != null && b.columnSize != null) {
    return equalOrUnknown(a.columnSize, b.columnSize);
  }

  return false;
};

export const linearizeType = (type: Type): Type[] =>
  type.cellType ? [type, ...linearizeType(type.cellType)] : [type];

export const deLinearizeType = (types: Type[]): Type => {
  const [initialType, ...rest] = types;
  return Type.combine(initialType, ...rest).mapType(() =>
    types.length === 1
      ? initialType
      : produce(types[0], (type) => {
          type.cellType = deLinearizeType(rest);
        })
  );
};

export const typeToDimensionIds = (type: Type): DimensionId[] => {
  const linear = linearizeType(type).slice(0, -1);
  return linear.map((t, i) => t.indexedBy ?? i);
};

/** Place a new item in the head of an array */
export const chooseFirst = <T>(indexOnTop: number, items: T[]): T[] => [
  items[indexOnTop],
  ...items.filter((_, i) => i !== indexOnTop),
];

/** undo a chooseFirst() */
export const undoChooseFirst = <T>(indexOnTop: number, items: T[]) =>
  items.flatMap((item, index) => {
    if (index === 0) {
      return indexOnTop === 0 ? [item] : [];
    }
    if (index === indexOnTop) {
      return [item, items[0]];
    }
    return [item];
  });
