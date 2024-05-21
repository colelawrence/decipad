import { BehaviorSubject } from 'rxjs';
import type { Type, Value } from '@decipad/language-interfaces';
import type { SymbolStream } from './ExecutionContextType';

export const createSymbolStream = (
  type: Type,
  value: Value.Value
): SymbolStream => ({
  typeStream: new BehaviorSubject(type),
  valueStream: new BehaviorSubject(value),
});
