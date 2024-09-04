import { expect, describe, it } from 'vitest';
import { N } from '@decipad/number';
import { Value, buildType } from '..';
import { ExecutionContext } from './ExecutionContext';
import { createSymbolStream } from './SymbolStream';

describe('ExecutionContext', () => {
  it('can start blank', () => {
    const context = ExecutionContext.create();
    expect(context.getSymbolStream('foo')).toBeUndefined();
  });

  it('can set new streams', () => {
    const context = ExecutionContext.create();
    const source1 = createSymbolStream(
      buildType.number(),
      Value.Scalar.fromValue(N(42))
    );
    context.setSymbolStream('foo', source1);
    expect(context.getSymbolStream('does not exist')).toBeUndefined();
    const stream = context.getSymbolStream('foo');
    expect(stream?.typeStream.value).toBe(source1.typeStream.value);
    expect(stream?.valueStream.value).toBe(source1.valueStream.value);
  });

  it('can replace streams', () => {
    const context = ExecutionContext.create();
    const source1 = createSymbolStream(
      buildType.number(),
      Value.Scalar.fromValue(N(42))
    );
    context.setSymbolStream('foo', source1);
    const stream = context.getSymbolStream('foo');
    expect(stream?.typeStream.value).toBe(source1.typeStream.value);
    expect(stream?.valueStream.value).toBe(source1.valueStream.value);

    const source2 = createSymbolStream(
      buildType.string(),
      Value.Scalar.fromValue('hello')
    );
    context.setSymbolStream('foo', source2);
    expect(stream?.typeStream.value).toBe(source2.typeStream.value);
    expect(stream?.valueStream.value).toBe(source2.valueStream.value);

    // emit a new value in the old stream
    source1.typeStream.next(buildType.boolean());
    source1.valueStream.next(Value.Scalar.fromValue(true));

    // the stream in the context should not have changed
    expect(stream?.typeStream.value).toBe(source2.typeStream.value);
    expect(stream?.valueStream.value).toBe(source2.valueStream.value);
  });
});
