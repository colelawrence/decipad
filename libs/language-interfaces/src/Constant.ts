import type { Type } from './Type';
import type { Value } from './Value';

export interface Constant {
  name: string;
  type: Type;
  value: Value;
}
