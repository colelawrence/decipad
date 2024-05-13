import type { OneResult } from '../Result';

export interface LowLevelMinimalTensor {
  lowLowLevelGet(...keys: number[]): Promise<OneResult>;
}
