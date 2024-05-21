import type { OneResult } from '../Result';

export interface Value {
  getData(): Promise<OneResult>;
}
