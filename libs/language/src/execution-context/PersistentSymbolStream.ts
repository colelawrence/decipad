import type { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import type { SymbolStream } from './ExecutionContextType';

export class PersistentSymbolStream {
  private sourceStream: BehaviorSubject<SymbolStream>;
  private subscription?: Subscription;
  private subSubscriptions: Subscription[] = [];
  private cachedPersistentSink?: SymbolStream;

  constructor(source: SymbolStream) {
    this.sourceStream = new BehaviorSubject(source);
  }

  get sink(): SymbolStream {
    if (!this.cachedPersistentSink) {
      const sink: SymbolStream = {
        typeStream: new BehaviorSubject(
          this.sourceStream.value.typeStream.value
        ),
        valueStream: new BehaviorSubject(
          this.sourceStream.value.valueStream.value
        ),
      };
      this.subscription = this.sourceStream.subscribe((source) => {
        this.subSubscriptions.forEach((sub) => sub.unsubscribe());
        this.subSubscriptions = [];
        this.subSubscriptions.push(
          source.typeStream.subscribe(sink.typeStream)
        );
        this.subSubscriptions.push(
          source.valueStream.subscribe(sink.valueStream)
        );
      });
      this.cachedPersistentSink = sink;
    }
    return this.cachedPersistentSink;
  }

  replaceSource(source: SymbolStream) {
    this.sourceStream.next(source);
  }

  destroy() {
    this.subscription?.unsubscribe();
    this.subSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  static fromSymbolStream(source: SymbolStream) {
    return new PersistentSymbolStream(source);
  }
}
