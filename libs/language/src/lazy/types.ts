import { ColumnLike, Value } from '../interpreter/Value';

export type DimensionId = string | number;
export interface Dimension {
  dimensionId: DimensionId;
  dimensionLength: number;
}

export interface MinimalHypercube {
  lowLevelGet: (...indices: number[]) => Value;
  dimensions: Dimension[];
}

// ColumnLike extends Value so this is a Value too
export type HypercubeLike = ColumnLike & MinimalHypercube;

export type OperationFunction = (values: Value[]) => Value;
