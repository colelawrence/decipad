import { expect, it } from 'vitest';
import { assertInstanceOf } from './assertInstanceOf';

class TestClass {}

it('throws', () => {
  expect(() => assertInstanceOf({}, Error)).toThrow();
  expect(() => assertInstanceOf(new Error('hello'), DataView)).toThrow();
  expect(() => assertInstanceOf('', Number)).toThrow();
  expect(() => assertInstanceOf(new ArrayBuffer(20), Uint8Array)).toThrow();
});

it('doesnt throw', () => {
  expect(() => assertInstanceOf(new Error(''), Error)).not.toThrow();
  expect(() => assertInstanceOf(new TestClass(), TestClass)).not.toThrow();
  expect(() =>
    assertInstanceOf(new ArrayBuffer(100), ArrayBuffer)
  ).not.toThrow();
});
