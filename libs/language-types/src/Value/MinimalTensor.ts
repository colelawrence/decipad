import type { Value, Dimension, Result } from '@decipad/language-interfaces';

export interface MinimalTensor {
  lowLevelGet(...keys: number[]): Promise<Value.Value>;
  lowLowLevelGet(...keys: number[]): Promise<Result.OneResult>;
  dimensions(): Promise<Dimension[]>;
  indexToLabelIndex?: (index: number) => number | Promise<number>;
  setDimensions: (dimensions: Dimension[]) => void;
}
