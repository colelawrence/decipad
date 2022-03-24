import { ColumnLike, Value } from '../interpreter/Value';

export type DimensionId = string | number;
export interface Dimension {
  dimensionLength: number;
}

export type MinimalHypercube = Pick<
  ColumnLike,
  'lowLevelGet' | 'dimensions' | 'indexToLabelIndex'
>;

export type OperationFunction = (values: Value[]) => Value;
