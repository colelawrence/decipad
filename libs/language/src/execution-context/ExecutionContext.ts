import type {
  ExecutionContextType,
  SymbolStream,
} from './ExecutionContextType';
import { PersistentSymbolStream } from './PersistentSymbolStream';

export class ExecutionContext implements ExecutionContextType {
  private symbolStreams: Map<string, PersistentSymbolStream> = new Map();
  private parent?: ExecutionContextType;

  constructor(parent?: ExecutionContextType) {
    this.parent = parent;
  }

  getSymbolStream(symbol: string): SymbolStream | undefined {
    return (
      this.symbolStreams.get(symbol)?.sink ??
      this.parent?.getSymbolStream(symbol)
    );
  }

  setSymbolStream(symbol: string, source: SymbolStream): void {
    const stream = this.symbolStreams.get(symbol);
    if (stream) {
      stream.replaceSource(source);
    } else {
      this.symbolStreams.set(
        symbol,
        PersistentSymbolStream.fromSymbolStream(source)
      );
    }
  }

  removeSymbolStream(symbol: string): void {
    const stream = this.symbolStreams.get(symbol);
    if (stream) {
      stream.destroy();
      this.symbolStreams.delete(symbol);
    }
  }

  subContext(): ExecutionContextType {
    return new ExecutionContext(this);
  }

  static create(): ExecutionContext {
    return new ExecutionContext();
  }
}
