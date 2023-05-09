import { buildType as t } from '.';
import { typeSnapshotSerializer } from '../testUtils';
import { parseUnit } from '../units';
import { narrowFunctionCall, narrowTypes } from './narrowing';
import { parseFunctionSignature, parseType } from './parseType';

expect.addSnapshotSerializer(typeSnapshotSerializer);

it('can narrow some types', async () => {
  expect(
    await narrowTypes(parseType('number'), parseType('number'))
  ).toMatchInlineSnapshot(`number`);
  expect(
    await narrowTypes(parseType('boolean'), parseType('boolean'))
  ).toMatchInlineSnapshot(`boolean`);

  expect(
    (await narrowTypes(parseType('number'), parseType('string'))).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
});

it('can narrow percentages', async () => {
  expect(
    await narrowTypes(t.number(), t.number(null, 'percentage'))
  ).toMatchInlineSnapshot(`number`);
  expect(
    await narrowTypes(t.number(null, 'percentage'), t.number())
  ).toMatchInlineSnapshot(`number`);
  expect(
    await narrowTypes(
      t.number(null, 'percentage'),
      t.number(null, 'percentage')
    )
  ).toMatchInlineSnapshot(`percentage`);
});

it('can narrow `anything`', async () => {
  expect(
    await narrowTypes(parseType('column<number>'), parseType('anything'))
  ).toMatchInlineSnapshot(`column<number>`);
  expect(
    await narrowTypes(
      parseType('column<number>'),
      parseType('column<anything>')
    )
  ).toMatchInlineSnapshot(`column<number>`);
});

it('can narrow units', async () => {
  const meters = t.number([parseUnit('meters')]);
  expect(await narrowTypes(meters, t.number())).toMatchInlineSnapshot(`meters`);

  expect(await narrowTypes(meters, meters)).toMatchInlineSnapshot(`meters`);

  expect(
    (await narrowTypes(meters, t.number([parseUnit('seconds')]))).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-unit]`);
});

describe('percentages', () => {
  it('can narrow percentages', async () => {
    expect(
      await narrowTypes(t.number(), t.number(null, 'percentage'))
    ).toMatchInlineSnapshot(`number`);

    expect(
      await narrowTypes(t.number(), t.number(null, 'percentage'))
    ).toMatchInlineSnapshot(`number`);

    expect(
      await narrowTypes(t.number(null, 'percentage'), t.number())
    ).toMatchInlineSnapshot(`number`);
  });

  it('narrows with units', async () => {
    const meters = t.number([parseUnit('meters')]);
    expect(
      await narrowTypes(meters, t.number(null, 'percentage'))
    ).toMatchInlineSnapshot(`meters`);
  });
});

it('can narrow dates', async () => {
  expect(await narrowTypes(t.date('day'), t.date('day'))).toMatchInlineSnapshot(
    `date<day>`
  );
  expect(
    (await narrowTypes(t.date('day'), t.date('hour'))).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
});

it('explains where the error came from', async () => {
  expect(
    (
      await narrowTypes(
        parseType('column<range<number>>'),
        parseType('column<string>')
      )
    ).errorCause?.pathToError
  ).toEqual(['column']);

  expect(
    (
      await narrowTypes(
        parseType('column<range<number>>'),
        parseType('column<range<string>>')
      )
    ).errorCause?.pathToError
  ).toEqual(['column', 'range']);
});

describe('narrow func call', () => {
  it('validates args', async () => {
    expect(
      await narrowFunctionCall({
        args: [parseType('number'), parseType('number')],
        ...parseFunctionSignature('number, number -> string'),
      })
    ).toMatchInlineSnapshot(`string`);

    expect(
      (
        await narrowFunctionCall({
          args: [parseType('string'), parseType('number')],
          ...parseFunctionSignature('number, number -> string'),
        })
      ).errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: expected-but-got]`);
  });

  it('propagates symbols to ret', async () => {
    expect(
      await narrowFunctionCall({
        args: [parseType('number')],
        ...parseFunctionSignature('A -> A'),
      })
    ).toMatchInlineSnapshot(`number`);

    expect(
      await narrowFunctionCall({
        args: [parseType('column<number>')],
        ...parseFunctionSignature('column<A> -> column<A>'),
      })
    ).toMatchInlineSnapshot(`column<number>`);

    expect(
      await narrowFunctionCall({
        args: [parseType('column<boolean>')],
        ...parseFunctionSignature('column<A> -> A'),
      })
    ).toMatchInlineSnapshot(`boolean`);

    expect(
      await narrowFunctionCall({
        args: [parseType('column<number>')],
        ...parseFunctionSignature('column<A>:B -> B'),
      })
    ).toMatchInlineSnapshot(`column<number>`);
  });

  it('propagates symbols to other args', async () => {
    expect(
      await narrowFunctionCall({
        args: [t.number(), t.number()],
        ...parseFunctionSignature('A, A -> boolean'),
      })
    ).toMatchInlineSnapshot(`boolean`);

    expect(
      await narrowFunctionCall({
        args: [t.string(), t.number()],
        ...parseFunctionSignature('A, A -> boolean'),
      })
    ).toMatchInlineSnapshot(`InferError expected-but-got`);

    expect(
      await narrowFunctionCall({
        args: [parseType('string'), parseType('column<string>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`boolean`);

    expect(
      await narrowFunctionCall({
        args: [parseType('string'), parseType('column<number>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`InferError expected-but-got`);

    expect(
      await narrowFunctionCall({
        args: [parseType('number'), parseType('column<string>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`InferError expected-but-got`);
  });
});

it('cant narrow tables, rows, functions', async () => {
  const table = t.table({
    columnNames: ['X'],
    columnTypes: [t.boolean()],
  });
  const row = t.row([t.boolean()], ['X']);
  const func = t.functionPlaceholder('fname', undefined);

  await expect(async () => narrowTypes(table, table)).rejects.toThrow();
  await expect(async () => narrowTypes(row, row)).rejects.toThrow();
  await expect(async () => narrowTypes(func, func)).rejects.toThrow();
});
