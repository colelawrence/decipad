import { Interpreter } from '../interpreter';
import { SerializedType } from '../type';

export type Validate = <T extends Interpreter.OneResult | null | undefined>(
  type: SerializedType,
  value: T
) => Interpreter.OneResult | null | undefined;
