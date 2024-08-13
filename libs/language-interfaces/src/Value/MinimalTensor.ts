import type { Dimension } from '../Dimension';
import type { ResultMetadataColumn } from '../Result';
import type { Value } from './Value';

export interface MinimalTensor {
  lowLevelGet(...keys: number[]): Promise<Value>;
  dimensions(): Promise<Dimension[]>;
  indexToLabelIndex?: (index: number) => number | Promise<number>;
  setDimensions: (dimensions: Dimension[]) => void;
  meta: undefined | (() => ResultMetadataColumn | undefined);
}
