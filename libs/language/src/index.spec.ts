// E2e tests

import { build as t } from './type';
import { runCode } from './run';
import {
  runCodeForVariables,
  objectToTableType,
  objectToTupleValue,
  runAST,
} from './testUtils';
import { parseUTCDate } from './date';
import { Column, Scalar } from './interpreter/Value';
import { block, n } from './utils';

describe('basic code', () => {
  it('runs basic operations', async () => {
    expect(
      await runCode(`
        [
          1 + 1,
          -1,
          55 % 2,
          101%,
          1 / 4,
          2 ^ 4,
          sqrt(16)
        ]
      `)
    ).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [2, -1, 1, 1.01, 0.25, 16, 4],
    });
  });

  it('supports boolean ops', async () => {
    expect(
      await runCode(`
        [
          1 >= 1,
          1 > 1,
          1 <= 1,
          1 < 1,
          1 == 1
        ]
      `)
    ).toMatchObject({
      type: { cellType: { type: 'boolean' } },
      value: [true, false, true, false, true],
    });
  });

  it('has correct operator precedence', async () => {
    expect(await runCode('1 + 2 / 4 - 5 ** 2 / 4')).toMatchObject({
      type: { type: 'number' },
      value: -4.75,
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
      value: 2,
    });
  });

  it('supports functions', async () => {
    const results = await runCode(`
      function functionname(a b) => a + b

      functionname(1, 2)
    `);

    expect(results).toMatchObject({
      type: { type: 'number' },
      value: 3,
    });
  });

  it('Can perform operations between columns', async () => {
    const results = await runCode(`
      Column = [ 0, 1, 2, 4 ]

      Column * [ 2, 2, 2, 3 ]
    `);

    expect(results).toMatchObject({
      type: { columnSize: 4, cellType: { type: 'number' } },
      value: [0, 2, 4, 12],
    });
  });

  it('Can use + for strings too', async () => {
    const results = await runCodeForVariables(
      `
        Two = 1 + 1
        Eleven = "1" + "1"
      `,
      ['Two', 'Eleven']
    );

    expect(results).toMatchObject({
      types: {
        Two: t.number(),
        Eleven: t.string(),
      },
      variables: {
        Two: 2,
        Eleven: '11',
      },
    });
  });

  it('Can perform binops between columns and single numbers', async () => {
    const results = await runCode(`
      Column = [ 1, 2, 3 ]
      Column * 2
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3 },
      value: [2, 4, 6],
    });

    const results2 = await runCode(`
      Column = [ 1, 2, 4 ]
      2 / Column
    `);

    expect(results2).toMatchObject({
      type: { columnSize: 3 },
      value: [2, 1, 0.5],
    });
  });

  it('Can run a function with a column as only the first argument', async () => {
    const results = await runCode(`
      function multiply(A B) => A * B
      multiply([ 1, 2, 3 ], 2)
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [2, 4, 6],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      function multiply(A B) => A * B
      multiply([ 1, 2, 3 ], [ 1, 2, 0 ])
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [1, 4, 0],
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
      value: 1,
    });

    expect(
      await runCode(`
        A = if 1 > 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: 0,
    });
  });
});

describe('Tables', () => {
  it('can be created', async () => {
    expect(
      await runCode(`Table = { Column1 = [1, 2, 3], Column2 = Column1 * 2 }`)
    ).toMatchObject({
      type: objectToTableType('Table', 3, {
        Column1: t.number(),
        Column2: t.number(),
      }),
      value: objectToTupleValue({
        Column1: [1, 2, 3],
        Column2: [2, 4, 6],
      }),
    });
  });

  it('can refer to the previous thing', async () => {
    expect(
      await runCode(`
        Table = {
          Column1 = [1, 1, 1],
          Column2 = Column1 + previous(0)
        }
      `)
    ).toEqual({
      type: objectToTableType('Table', 3, {
        Column1: t.number(),
        Column2: t.number(),
      }),
      value: objectToTupleValue({
        Column1: [1, 1, 1],
        Column2: [1, 2, 3],
      }),
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
      type: objectToTableType('Table', 3, {
        Column1: t.number(),
        Column2: t.number(),
        Column3: t.boolean(),
      }),
      value: objectToTupleValue({
        Column1: [1, 2, 3],
        Column2: [0.5, 1, 1.5],
        Column3: [false, false, true],
      }),
    });
  });

  it('Can be referred to by column', async () => {
    expect(
      await runCode(`
        Table = {
          Col = [1, 2, 3]
        }

        Table.Col
      `)
    ).toMatchObject({
      type: t.column(t.number(), 3, 'Table'),
      value: [1, 2, 3],
    });
  });

  it('Can expand items', async () => {
    expect(
      await runCode(`
        Table = {
          Col = [1, 2, 3],
          Col2 = 1
        }

        Table.Col2
      `)
    ).toMatchObject({
      type: t.column(t.number(), 3, 'Table'),
      value: [1, 1, 1],
    });

    expect(
      await runCode(`
        Table = {
          Col = 1,
          Col2 = [1, 2, 3]
        }

        Table.Col
      `)
    ).toMatchObject({
      type: t.column(t.number(), 3, 'Table'),
      value: [1, 1, 1],
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
      value: 1,
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
      value: 1,
      type: {
        unit: [
          {
            exp: 1,
            known: true,
            multiplier: 1,
            unit: 'meters',
          },
          {
            exp: -1,
            known: true,
            multiplier: 1,
            unit: 'seconds',
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
      value: 6,
      type: { unit: [{ exp: 1, known: true, multiplier: 1, unit: 'meters' }] },
    });

    // TODO internally it's fine but do we actually want to support
    // calculations that result in a unit^-1?
    expect(
      await runCode(`
        Speed = 6 meter/second

        Distance = Speed / 3 meter
      `)
    ).toMatchObject({
      value: 2,
      type: {
        unit: [{ exp: -1, known: true, multiplier: 1, unit: 'seconds' }],
      },
    });
  });
});

describe('Ranges', () => {
  it('Evaluates and types ranges', async () => {
    expect(
      await runCode(`
        Range = [1..3]
        Containment = contains(Range, 3)
      `)
    ).toMatchObject({
      type: { type: 'boolean' },
      value: true,
    });
  });
});

describe('Dates', () => {
  it('Evaluates and types dates', async () => {
    expect(
      await runCode(`
        Time = date(2020-10-10 10:30)
      `)
    ).toMatchObject({
      value: parseUTCDate('2020-10-10T10:30'),
    });
  });

  it('Evaluates tables of dates', async () => {
    expect(
      await runCode(`
        Table = {
          Months = [ date(2020-09), date(2020-10), date(2020-11) ],
          Days = dateequals(Months, [ date(2020-09), date(2020-11), date(2020-10) ])
        }
      `)
    ).toMatchObject({
      value: objectToTupleValue({
        Months: [Date.UTC(2020, 8), Date.UTC(2020, 9), Date.UTC(2020, 10)],
        Days: [true, false, false],
      }),
    });
  });
});

describe('Time quantities', () => {
  it('evaluates time quantities', async () => {
    expect(
      await runCodeForVariables(
        `
        Years = [ 7 years ]
        Quarters = [ 3 quarters ]
        Seconds = [ 999 seconds ]
        Combined = [ 4 quarters, 3 second, 1 millisecond ]
      `,
        ['Years', 'Quarters', 'Seconds', 'Combined']
      )
    ).toEqual({
      variables: {
        Years: [['year', 7]],
        Quarters: [['quarter', 3]],
        Seconds: [['second', 999]],
        Combined: [
          ['quarter', 4],
          ['second', 3],
          ['millisecond', 1],
        ],
      },
      types: {
        Years: t.timeQuantity(['year']),
        Quarters: t.timeQuantity(['quarter']),
        Seconds: t.timeQuantity(['second']),
        Combined: t.timeQuantity(['quarter', 'second', 'millisecond']),
      },
    });
  });
});

describe('Given', () => {
  it('Works on single dims and tables', async () => {
    expect(
      await runCode(`
        Col = [1, 2, 3]
        given Col: Col + 1
      `)
    ).toMatchObject({
      value: [2, 3, 4],
      type: {
        columnSize: 3,
        cellType: { type: 'number' },
      },
    });

    expect(
      await runCode(`
        Col = {
          Ayy = [1, 2, 3],
          Bee = [1, 2, 3]
        }
        given Col: Col.Ayy - Col.Bee
      `)
    ).toMatchObject({
      value: [0, 0, 0],
      type: {
        columnSize: 3,
        cellType: { type: 'number' },
      },
    });

    expect(
      await runCode(`
        Tbl = {
          Ayy = [1, 2, 3],
          Bee = [4, 5, 6]
        }
        given Tbl: { Ayy = Tbl.Ayy, Bee = Tbl.Bee }
      `)
    ).toMatchObject({
      value: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      type: {
        tableLength: 3,
        columnNames: ['Ayy', 'Bee'],
        columnTypes: [{ type: 'number' }, { type: 'number' }],
      },
    });
  });
});

describe('Injected external data', () => {
  it('can be injected into the language', async () => {
    expect(
      await runAST(block(n('externalref', 'random-id')), {
        externalData: {
          'random-id': {
            type: t.column(t.string(), 2),
            value: Column.fromValues([
              Scalar.fromValue('Hello'),
              Scalar.fromValue('World'),
            ]),
          },
        },
      })
    ).toMatchObject({
      value: ['Hello', 'World'],
      type: t.column(t.string(), 2),
    });
  });
});
