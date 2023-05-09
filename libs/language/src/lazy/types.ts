import { PromiseOrType } from '@decipad/utils';
import { ColumnLikeValue, Value } from '../value';

export type DimensionId = string | number;
export interface Dimension {
  dimensionLength: number;
}

export type MinimalTensor = Pick<
  ColumnLikeValue,
  'lowLevelGet' | 'dimensions' | 'indexToLabelIndex'
> & {
  setDimensions: (dimensions: Dimension[]) => void;
};

export type OperationFunction = (values: Value[]) => PromiseOrType<Value>;
