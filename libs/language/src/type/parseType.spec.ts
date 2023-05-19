import stringify from 'json-stringify-safe';
import { Type, serializeType } from '.';
import { parseFunctionSignature, parseType } from './parseType';

expect.addSnapshotSerializer({
  test(t) {
    return t instanceof Type;
  },
  serialize(type: Type) {
    return stringify(serializeType(type));
  },
});

it('creates primitives', () => {
  expect(parseType('number')).toMatchInlineSnapshot(
    `{"kind":"number","unit":null}`
  );
  expect(parseType('string')).toMatchInlineSnapshot(`{"kind":"string"}`);
  expect(parseType('boolean')).toMatchInlineSnapshot(`{"kind":"boolean"}`);
});

it('creates columns', () => {
  expect(parseType('column<number>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null}}`
  );
  expect(parseType('column<column<number>>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null}}}`
  );
  expect(parseType('column<number>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null}}`
  );
  expect(parseType('column<number>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null}}`
  );
});

it('constructs anything', () => {
  expect(parseType('anything')).toMatchInlineSnapshot(`{"kind":"anything"}`);
  expect(parseType('column<anything>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"anything"}}`
  );
});

it('understands symbols', () => {
  expect(parseType('number:A')).toMatchInlineSnapshot(
    `{"kind":"number","unit":null,"symbol":"A"}`
  );
  expect(parseType('column<anything:A>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"anything","symbol":"A"}}`
  );
  expect(parseType('column<anything>:A')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"anything"},"symbol":"A"}`
  );
  expect(parseType('A')).toMatchInlineSnapshot(
    `{"kind":"anything","symbol":"A"}`
  );
});

it('understands nothing and anything', () => {
  expect(parseType('anything')).toMatchInlineSnapshot(`{"kind":"anything"}`);
  expect(parseType('nothing')).toMatchInlineSnapshot(`{"kind":"nothing"}`);
});

it('parses function sigs', () => {
  expect(parseFunctionSignature('number, number -> boolean'))
    .toMatchInlineSnapshot(`
      Object {
        "expectedArgs": Array [
          {"kind":"number","unit":null},
          {"kind":"number","unit":null},
        ],
        "returnType": {"kind":"boolean"},
      }
    `);
});

it('errors', () => {
  expect(() => parseType('number number')).toThrow(/garbage at the end/);

  expect(() => parseType('column<number x')).toThrow(/expected gt/);

  expect(() => parseType('>')).toThrow(/unexpected/);

  expect(() => parseType('column<number, A>')).toThrow(/expected/);
});
