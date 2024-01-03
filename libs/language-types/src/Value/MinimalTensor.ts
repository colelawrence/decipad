import { Dimension } from '../Dimension';
import { Value } from './Value';

export interface MinimalTensor {
  lowLevelGet(...keys: number[]): Promise<Value>;
  dimensions(): Promise<Dimension[]>;
  indexToLabelIndex?: (index: number) => number | Promise<number>;
  setDimensions: (dimensions: Dimension[]) => void;
}
