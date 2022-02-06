import { produce } from 'immer';
import { zip } from '@decipad/utils';
import { equalOrUnknown } from '../utils';
import { Column, Value } from '../interpreter/Value';
import { Type, build as t } from '../type';

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

export const chooseFirst = <T>(indexOnTop: number, items: T[]): T[] => [
  items[indexOnTop],
  ...items.filter((_, i) => i !== indexOnTop),
];

export function heightenValueDimensionsIfNecessary(
  argTypes: Type[],
  argValues: Value[],
  expectedCardinalities: number[]
): [raised: Type[], raisedValues: Value[]] {
  const heightenOne = (
    type: Type,
    value: Value,
    expected: number
  ): [Type, Value] => {
    if (getCardinality(type) < expected) {
      return heightenOne(
        t.column(type, 1),
        Column.fromValues([value]),
        expected
      );
    } else {
      return [type, value];
    }
  };

  const retTypes = [];
  const retValues = [];
  for (let i = 0; i < expectedCardinalities.length; i++) {
    const [type, value] = heightenOne(
      argTypes[i],
      argValues[i],
      expectedCardinalities[i]
    );
    retTypes.push(type);
    retValues.push(value);
  }

  return [retTypes, retValues];
}

export function heightenDimensionsIfNecessary(
  argTypes: Type[],
  expectedCardinalities: number[]
): Type[] {
  return zip(argTypes, expectedCardinalities).map(function heighten([
    type,
    expectedCardinality,
  ]): Type {
    if (getCardinality(type) < expectedCardinality) {
      return heighten([t.column(type, 1), expectedCardinality]);
    } else {
      return type;
    }
  });
}
