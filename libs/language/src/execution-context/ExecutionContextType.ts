import type { BehaviorSubject } from 'rxjs';
import type { Type, Value } from '@decipad/language-interfaces';

export interface SymbolStream {
  typeStream: BehaviorSubject<Type>;
  valueStream: BehaviorSubject<Value.Value>;
}

export interface ExecutionContextType {
  getSymbolStream(symbol: string): SymbolStream | undefined;
  setSymbolStream(symbol: string, stream: SymbolStream): void;
  removeSymbolStream(symbol: string): void;
  subContext(): ExecutionContextType;
}
