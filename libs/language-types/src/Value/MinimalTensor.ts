import type { Value, Dimension } from '@decipad/language-interfaces';

export interface MinimalTensor {
  lowLevelGet(...keys: number[]): Promise<Value.Value>;
  dimensions(): Promise<Dimension[]>;
  indexToLabelIndex?: (index: number) => number | Promise<number>;
  setDimensions: (dimensions: Dimension[]) => void;
}
