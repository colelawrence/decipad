import { Type, serializeType } from '.';
import { parseFunctionSignature, parseType } from './parseType';

expect.addSnapshotSerializer({
  test(t) {
    return t instanceof Type;
  },
  serialize(type: Type) {
    return JSON.stringify(serializeType(type));
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
  expect(parseType('column<number, 2>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":"unknown"}`
  );
  expect(parseType('column<column<number, 2>, 7>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":"unknown"},"columnSize":"unknown"}`
  );
  expect(parseType('column<number>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":"unknown"}`
  );
  expect(parseType('column<number, unknown>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":"unknown"}`
  );
});

it('constructs anything', () => {
  expect(parseType('anything')).toMatchInlineSnapshot(`{"kind":"anything"}`);
  expect(parseType('column<anything, 2>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"anything"},"columnSize":"unknown"}`
  );
});

it('understands symbols', () => {
  expect(parseType('number:A')).toMatchInlineSnapshot(
    `{"kind":"number","unit":null,"symbol":"A"}`
  );
  expect(parseType('column<anything:A, 3>')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"anything","symbol":"A"},"columnSize":"unknown"}`
  );
  expect(parseType('column<anything, 2>:A')).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"anything"},"columnSize":"unknown","symbol":"A"}`
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

  expect(() => parseType('column<number, A>')).toThrow(/unexpected/);
});
