import { buildType as t } from '.';
import { typeSnapshotSerializer } from '../testUtils';
import { parseUnit } from '../units';
import { narrowFunctionCall, narrowTypes } from './narrowing';
import { parseFunctionSignature, parseType } from './parseType';

expect.addSnapshotSerializer(typeSnapshotSerializer);

it('can narrow some types', () => {
  expect(
    narrowTypes(parseType('number'), parseType('number'))
  ).toMatchInlineSnapshot(`number`);
  expect(
    narrowTypes(parseType('boolean'), parseType('boolean'))
  ).toMatchInlineSnapshot(`boolean`);

  expect(
    narrowTypes(parseType('number'), parseType('string')).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
});

it('can narrow percentages', () => {
  expect(
    narrowTypes(t.number(), t.number(null, 'percentage'))
  ).toMatchInlineSnapshot(`number`);
  expect(
    narrowTypes(t.number(null, 'percentage'), t.number())
  ).toMatchInlineSnapshot(`number`);
  expect(
    narrowTypes(t.number(null, 'percentage'), t.number(null, 'percentage'))
  ).toMatchInlineSnapshot(`percentage`);
});

it('can narrow `anything`', () => {
  expect(
    narrowTypes(parseType('column<number>'), parseType('anything'))
  ).toMatchInlineSnapshot(`column<number>`);
  expect(
    narrowTypes(parseType('column<number>'), parseType('column<anything>'))
  ).toMatchInlineSnapshot(`column<number>`);
});

it('can narrow units', () => {
  const meters = t.number([parseUnit('meters')]);
  expect(narrowTypes(meters, t.number())).toMatchInlineSnapshot(`meters`);

  expect(narrowTypes(meters, meters)).toMatchInlineSnapshot(`meters`);

  expect(
    narrowTypes(meters, t.number([parseUnit('seconds')])).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-unit]`);
});

describe('percentages', () => {
  it('can narrow percentages', () => {
    expect(
      narrowTypes(t.number(), t.number(null, 'percentage'))
    ).toMatchInlineSnapshot(`number`);

    expect(
      narrowTypes(t.number(), t.number(null, 'percentage'))
    ).toMatchInlineSnapshot(`number`);

    expect(
      narrowTypes(t.number(null, 'percentage'), t.number())
    ).toMatchInlineSnapshot(`number`);
  });

  it('narrows with units', () => {
    const meters = t.number([parseUnit('meters')]);
    expect(
      narrowTypes(meters, t.number(null, 'percentage'))
    ).toMatchInlineSnapshot(`meters`);
  });
});

it('can narrow dates', () => {
  expect(narrowTypes(t.date('day'), t.date('day'))).toMatchInlineSnapshot(
    `date<day>`
  );
  expect(
    narrowTypes(t.date('day'), t.date('hour')).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
});

it('explains where the error came from', () => {
  expect(
    narrowTypes(parseType('column<range<number>>'), parseType('column<string>'))
      .errorCause?.pathToError
  ).toEqual(['column']);

  expect(
    narrowTypes(
      parseType('column<range<number>>'),
      parseType('column<range<string>>')
    ).errorCause?.pathToError
  ).toEqual(['column', 'range']);
});

describe('narrow func call', () => {
  it('validates args', () => {
    expect(
      narrowFunctionCall({
        args: [parseType('number'), parseType('number')],
        ...parseFunctionSignature('number, number -> string'),
      })
    ).toMatchInlineSnapshot(`string`);

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
    ).toMatchInlineSnapshot(`number`);

    expect(
      narrowFunctionCall({
        args: [parseType('column<number>')],
        ...parseFunctionSignature('column<A> -> column<A>'),
      })
    ).toMatchInlineSnapshot(`column<number>`);

    expect(
      narrowFunctionCall({
        args: [parseType('column<boolean>')],
        ...parseFunctionSignature('column<A> -> A'),
      })
    ).toMatchInlineSnapshot(`boolean`);

    expect(
      narrowFunctionCall({
        args: [parseType('column<number>')],
        ...parseFunctionSignature('column<A>:B -> B'),
      })
    ).toMatchInlineSnapshot(`column<number>`);
  });

  it('propagates symbols to other args', () => {
    expect(
      narrowFunctionCall({
        args: [t.number(), t.number()],
        ...parseFunctionSignature('A, A -> boolean'),
      })
    ).toMatchInlineSnapshot(`boolean`);

    expect(
      narrowFunctionCall({
        args: [t.string(), t.number()],
        ...parseFunctionSignature('A, A -> boolean'),
      })
    ).toMatchInlineSnapshot(`InferError expected-but-got`);

    expect(
      narrowFunctionCall({
        args: [parseType('string'), parseType('column<string>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`boolean`);

    expect(
      narrowFunctionCall({
        args: [parseType('string'), parseType('column<number>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`InferError expected-but-got`);

    expect(
      narrowFunctionCall({
        args: [parseType('number'), parseType('column<string>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`InferError expected-but-got`);
  });
});

it('cant narrow tables, rows, functions', () => {
  const table = t.table({
    columnNames: ['X'],
    columnTypes: [t.boolean()],
  });
  const row = t.row([t.boolean()], ['X']);
  const func = t.functionPlaceholder('fname', undefined);

  expect(() => narrowTypes(table, table)).toThrow();
  expect(() => narrowTypes(row, row)).toThrow();
  expect(() => narrowTypes(func, func)).toThrow();
});
