import { BehaviorSubject } from 'rxjs';
import type { SymbolStream } from './ExecutionContextType';
import { Value, buildType } from '..';

export const UnknownSymbolStream: SymbolStream = {
  typeStream: new BehaviorSubject(buildType.pending()),
  valueStream: new BehaviorSubject(Value.UnknownValue),
};
