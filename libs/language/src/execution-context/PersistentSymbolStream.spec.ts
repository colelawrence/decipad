import { BehaviorSubject } from 'rxjs';
import type { SymbolStream } from './ExecutionContextType';
import { PersistentSymbolStream } from './PersistentSymbolStream';
import { UnknownSymbolStream } from './UnknownSymbolStream';
import { Value, buildType } from '..';
import { N } from '@decipad/number';

const testSymbolStream = (): SymbolStream => ({
  typeStream: new BehaviorSubject(buildType.number()),
  valueStream: new BehaviorSubject(Value.Scalar.fromValue(N(42))),
});

const testSymbolStream2 = (): SymbolStream => ({
  typeStream: new BehaviorSubject(buildType.string()),
  valueStream: new BehaviorSubject(Value.Scalar.fromValue('Hello')),
});

describe('PersistentSymbolStream', () => {
  it('works initially', () => {
    const source = UnknownSymbolStream;
    const stream = PersistentSymbolStream.fromSymbolStream(source);
    const { sink } = stream;
    expect(sink.typeStream.value).toBe(source.typeStream.value);
    expect(sink.valueStream.value).toBe(source.valueStream.value);
  });

  it('the type and value can be updated', async () => {
    const source = UnknownSymbolStream;
    const stream = PersistentSymbolStream.fromSymbolStream(source);
    const { sink } = stream;
    source.typeStream.next(buildType.number());
    source.valueStream.next(Value.Scalar.fromValue(N(42)));
    expect(sink.typeStream.value).toEqual(buildType.number());
    expect(await sink.valueStream.value.getData()).toEqual(N(42));
  });

  it('can be replaced', async () => {
    const source = UnknownSymbolStream;
    const stream = PersistentSymbolStream.fromSymbolStream(source);
    const { sink } = stream;
    stream.replaceSource(testSymbolStream());
    expect(sink.typeStream.value).toEqual(buildType.number());
    expect(await sink.valueStream.value.getData()).toEqual(N(42));
  });

  it('does not leak', async () => {
    const source1 = testSymbolStream();
    const stream = PersistentSymbolStream.fromSymbolStream(source1);
    const { sink } = stream;
    stream.replaceSource(testSymbolStream2());
    source1.typeStream.next(buildType.boolean());
    source1.valueStream.next(Value.Scalar.fromValue(true));
    // even though we emitted new values on the source stream, they do not propagate to the persistent sink
    expect(sink.typeStream.value).toEqual(buildType.string());
    expect(await sink.valueStream.value.getData()).toEqual('Hello');
  });
});
