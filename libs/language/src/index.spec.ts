// E2e tests

import { Type } from './type';
import { runCode, objectToTupleType, objectToTupleValue } from './testUtils';

describe('basic code', () => {
  it('runs basic operations', async () => {
    expect(await runCode('1 + 1')).toMatchObject({
      type: { type: 'number' },
      value: [2],
    });

    expect(await runCode('-1')).toMatchObject({
      type: { type: 'number' },
      value: [-1],
    });

    expect(await runCode('1 / 4')).toMatchObject({
      type: { type: 'number' },
      value: [0.25],
    });
  });

  it('can assign variables', async () => {
    expect(
      await runCode(`
        A = 1

        1 + A
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: [2],
    });
  });

  it('supports functions', async () => {
    const results = await runCode(`
      functionname = a b => a + b

      functionname 1 2
    `);

    expect(results).toMatchObject({
      type: { type: 'number' },
      value: [3],
    });
  });

  it('Can perform operations between columns', async () => {
    const results = await runCode(`
      Column = [ 0, 1, 2, 4 ]

      Column * [ 2, 2, 2, 3 ]
    `);

    expect(results).toMatchObject({
      type: { columnSize: 4, cellType: { type: 'number' } },
      value: [[0, 2, 4, 12]],
    });
  });

  it('Can perform binops between columns and single numbers', async () => {
    const results = await runCode(`
      Column = [ 1, 2, 3 ]
      Column * 2
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3 },
      value: [[2, 4, 6]],
    });

    const results2 = await runCode(`
      Column = [ 1, 2, 4 ]
      2 / Column
    `);

    expect(results2).toMatchObject({
      type: { columnSize: 3 },
      value: [[2, 1, 0.5]],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      multiply = A B => A * B
      multiply [ 1, 2, 3 ] 2
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [[2, 4, 6]],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      multiply = A B => A * B
      multiply [ 1, 2, 3 ] [ 1, 2, 0 ]
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [[1, 4, 0]],
    });
  });

  it.todo('TODO: Does not allow empty columns');

  it('supports conditions', async () => {
    expect(
      await runCode(`
        A = if 1 < 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: [1],
    });

    expect(
      await runCode(`
        A = if 1 > 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: [0],
    });
  });
});

describe('Tables', () => {
  it('can be created', async () => {
    expect(
      await runCode(`Table = { Column1 = [1, 2, 3], Column2 = Column1 * 2 }`)
    ).toMatchObject({
      type: objectToTupleType({
        Column1: Type.build({ type: 'number', columnSize: 3 }),
        Column2: Type.build({ type: 'number', columnSize: 3 }),
      }),
      value: [
        objectToTupleValue({
          Column1: [1, 2, 3],
          Column2: [2, 4, 6],
        }),
      ],
    });
  });

  it('can refer to the previous thing', async () => {
    expect(
      await runCode(`
        Table = {
          Column1 = [1, 1, 1],
          Column2 = Column1 + (previous 0)
        }
      `)
    ).toMatchObject({
      type: objectToTupleType({
        Column1: Type.build({ type: 'number', columnSize: 3 }),
        Column2: Type.build({ type: 'number', columnSize: 3 }),
      }),
      value: [
        objectToTupleValue({
          Column1: [1, 1, 1],
          Column2: [1, 2, 3],
        }),
      ],
    });
  });

  it('can perform calculations between columns', async () => {
    expect(
      await runCode(`
        Table = {
          Column1 = [1, 2, 3],
          Column2 = Column1 / 2
          Column3 = Column2 > 1.1
        }
      `)
    ).toMatchObject({
      type: objectToTupleType({
        Column1: Type.build({ type: 'number', columnSize: 3 }),
        Column2: Type.build({ type: 'number', columnSize: 3 }),
        Column3: Type.build({ type: 'boolean', columnSize: 3 }),
      }),
      value: [
        objectToTupleValue({
          Column1: [1, 2, 3],
          Column2: [0.5, 1, 1.5],
          Column3: [false, false, true],
        }),
      ],
    });
  });
});

describe('Units', () => {
  it('numbers can have units', async () => {
    expect(
      await runCode(`
        Speed = 1 meter/second
      `)
    ).toMatchObject({
      type: {
        unit: [
          { exp: 1, known: true, multiplier: 1, unit: 'meter' },
          { exp: -1, known: true, multiplier: 1, unit: 'second' },
        ],
      },
      value: [1],
    });
  });

  it('units can be divided', async () => {
    expect(
      await runCode(`
        Distance = 3 meter
        Time = 3 second

        Distance / Time
      `)
    ).toMatchObject({
      value: [1],
      type: {
        unit: [
          {
            exp: 1,
            known: true,
            multiplier: 1,
            unit: 'meter',
          },
          {
            exp: -1,
            known: true,
            multiplier: 1,
            unit: 'second',
          },
        ],
      },
    });
  });

  it('units can be collapsed', async () => {
    expect(
      await runCode(`
        Speed = 2 meter/second

        Distance = Speed * 3 second
      `)
    ).toMatchObject({
      value: [6],
      type: { unit: [{ exp: 1, known: true, multiplier: 1, unit: 'meter' }] },
    });

    // TODO internally it's fine but do we actually want to support
    // calculations that result in a unit^-1?
    expect(
      await runCode(`
        Speed = 6 meter/second

        Distance = Speed / 3 meter
      `)
    ).toMatchObject({
      value: [2],
      type: { unit: [{ exp: -1, known: true, multiplier: 1, unit: 'second' }] },
    });
  });
});

describe('Ranges', () => {
  it('Evaluates and types ranges', async () => {
    expect(
      await runCode(`
        Range = [1..3]
        Containment = contains Range 3
      `)
    ).toMatchObject({
      type: { rangeness: false },
      value: [true],
    });
  });
});

describe('Dates', () => {
  it('Evaluates and types dates', async () => {
    expect(
      await runCode(`
        Time = 2020-10-10 10:30
      `)
    ).toMatchObject({
      value: [Array(2).fill(Date.UTC(2020, 9, 10, 10, 30))],
    });
  });

  it('Evaluates tables of dates', async () => {
    expect(
      await runCode(`
        Table = {
          Months = [ 2020-09, 2020-10, 2020-11 ],
          Days = (dateequals Months [ 2020-09, 2020-11, 2020-10 ])
        }
      `)
    ).toMatchObject({
      value: [
        objectToTupleValue({
          Months: [
            [Date.UTC(2020, 8), Date.UTC(2020, 9) - 1],
            [Date.UTC(2020, 9), Date.UTC(2020, 10) - 1],
            [Date.UTC(2020, 10), Date.UTC(2020, 11) - 1],
          ],
          Days: [true, false, false],
        }),
      ],
    });
  });
});

describe('Inference errors', () => {
  it.todo('TODO: Complains about missing variables');
  it.todo('TODO: Complains about mismatched units');
  it.todo('TODO: complains about mismatched types');

  it.todo('TODO: Complains about mismatched array units');
  it.todo('TODO: Complains about mismatched array lengths');
});
