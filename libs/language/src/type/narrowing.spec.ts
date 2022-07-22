import { parseUnit } from '../units';
import { Type, serializeType, build as t } from '.';
import { narrowFunctionCall, narrowTypes } from './narrowing';
import { parseFunctionSignature, parseType } from './parseType';

expect.addSnapshotSerializer({
  test(t) {
    return t instanceof Type;
  },
  serialize(type: Type) {
    return JSON.stringify(serializeType(type));
  },
});

it('can narrow some types', () => {
  expect(
    narrowTypes(parseType('number'), parseType('number'))
  ).toMatchInlineSnapshot(`{"kind":"number","unit":null}`);
  expect(
    narrowTypes(parseType('boolean'), parseType('boolean'))
  ).toMatchInlineSnapshot(`{"kind":"boolean"}`);

  expect(
    narrowTypes(parseType('number'), parseType('string')).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
});

it('can narrow percentages', () => {
  expect(
    narrowTypes(t.number(), t.number(null, 'percentage'))
  ).toMatchInlineSnapshot(`{"kind":"number","unit":null}`);
  expect(
    narrowTypes(t.number(null, 'percentage'), t.number())
  ).toMatchInlineSnapshot(`{"kind":"number","unit":null}`);
  expect(
    narrowTypes(t.number(null, 'percentage'), t.number(null, 'percentage'))
  ).toMatchInlineSnapshot(`{"kind":"number","numberFormat":"percentage"}`);
});

it('can narrow `anything`', () => {
  expect(
    narrowTypes(parseType('column<number, 2>'), parseType('anything'))
  ).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":2}`
  );
  expect(
    narrowTypes(
      parseType('column<number, 2>'),
      parseType('column<anything, 2>')
    )
  ).toMatchInlineSnapshot(
    `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":2}`
  );
});

it('can narrow units', () => {
  const meters = t.number([parseUnit('meters')]);
  expect(narrowTypes(meters, t.number())).toMatchInlineSnapshot(
    `{"kind":"number","unit":{"type":"units","args":[{"unit":"meters","exp":{"s":"1","n":"1","d":"1"},"multiplier":{"s":"1","n":"1","d":"1"},"known":true,"baseQuantity":"length","baseSuperQuantity":"length","thousandsSeparator":","}]}}`
  );

  expect(narrowTypes(meters, meters)).toMatchInlineSnapshot(
    `{"kind":"number","unit":{"type":"units","args":[{"unit":"meters","exp":{"s":"1","n":"1","d":"1"},"multiplier":{"s":"1","n":"1","d":"1"},"known":true,"baseQuantity":"length","baseSuperQuantity":"length","thousandsSeparator":","}]}}`
  );

  expect(
    narrowTypes(meters, t.number([parseUnit('seconds')])).errorCause
  ).toMatchInlineSnapshot(
    `[Error: Inference Error: cannot-convert-between-units]`
  );
});

it('can narrow dates', () => {
  expect(narrowTypes(t.date('day'), t.date('day'))).toMatchInlineSnapshot(
    `{"kind":"date","date":"day"}`
  );
  expect(
    narrowTypes(t.date('day'), t.date('hour')).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
});

it('can narrow columns', () => {
  expect(
    narrowTypes(parseType('column<number>'), parseType('column<number, 2>'))
      .columnSize
  ).toMatchInlineSnapshot(`2`);
  expect(
    narrowTypes(parseType('column<number, 2>'), parseType('column<number>'))
      .columnSize
  ).toMatchInlineSnapshot(`2`);

  expect(
    narrowTypes(parseType('column<number, 2>'), parseType('column<number, 3>'))
      .errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: free-form]`);
});

it('explains where the error came from', () => {
  expect(
    narrowTypes(parseType('column<range<number>>'), parseType('column<string>'))
      .cellType?.errorCause?.pathToError
  ).toEqual(['column']);

  expect(
    narrowTypes(
      parseType('column<range<number>>'),
      parseType('column<range<string>>')
    )?.cellType?.rangeOf?.errorCause?.pathToError
  ).toEqual(['column', 'range']);
});

describe('narrow func call', () => {
  it('validates args', () => {
    expect(
      narrowFunctionCall({
        args: [parseType('number'), parseType('number')],
        ...parseFunctionSignature('number, number -> string'),
      })
    ).toMatchInlineSnapshot(`{"kind":"string"}`);

    expect(
      narrowFunctionCall({
        args: [parseType('string'), parseType('number')],
        ...parseFunctionSignature('number, number -> string'),
      }).errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
  });

  it('propagates symbols to ret', () => {
    expect(
      narrowFunctionCall({
        args: [parseType('number')],
        ...parseFunctionSignature('A -> A'),
      })
    ).toMatchInlineSnapshot(`{"kind":"number","unit":null}`);

    expect(
      narrowFunctionCall({
        args: [parseType('column<boolean, 2>')],
        ...parseFunctionSignature('column<A> -> A'),
      })
    ).toMatchInlineSnapshot(`{"kind":"boolean"}`);

    expect(
      narrowFunctionCall({
        args: [parseType('column<number, 2>')],
        ...parseFunctionSignature('column<number:A>:B -> column<A>:B'),
      })
    ).toMatchInlineSnapshot(
      `{"kind":"column","indexedBy":null,"cellType":{"kind":"number","unit":null},"columnSize":2}`
    );
  });
});

it('cant narrow tables, rows, functions', () => {
  const table = t.table({
    length: 'unknown',
    columnNames: ['X'],
    columnTypes: [t.boolean()],
  });
  const row = t.row([t.boolean()], ['X']);
  const func = t.functionPlaceholder();

  expect(() => narrowTypes(table, table)).toThrow();
  expect(() => narrowTypes(row, row)).toThrow();
  expect(() => narrowTypes(func, func)).toThrow();
});
