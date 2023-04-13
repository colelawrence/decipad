import { ColumnLikeValue, Value } from '../value';

export type DimensionId = string | number;
export interface Dimension {
  dimensionLength: number;
}

export type MinimalTensor = Pick<
  ColumnLikeValue,
  'lowLevelGet' | 'dimensions' | 'indexToLabelIndex'
>;

export type OperationFunction = (values: Value[]) => Value;
