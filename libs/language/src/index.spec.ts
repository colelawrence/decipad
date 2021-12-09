// E2e tests

import { build as t, Type } from './type';
import { runCode } from './run';
import {
  runCodeForVariables,
  objectToTableType,
  objectToTupleValue,
  runAST,
} from './testUtils';
import { parseUTCDate } from './date';
import { Column, Scalar } from './interpreter/Value';
import { block, n, units, F, U, u } from './utils';
import { stringifyResult } from './repl';

expect.addSnapshotSerializer({
  test: (arg) => arg?.type instanceof Type && arg.value != null,
  serialize: ({ type, value }) =>
    `Result(${stringifyResult(value, type, (x) => x)})`,
});

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
      value: [
        { d: 1, n: 2, s: 1 },
        { d: 1, n: 1, s: -1 },
        { d: 1, n: 1, s: 1 },
        { d: 100, n: 101, s: 1 },
        { d: 4, n: 1, s: 1 },
        { d: 1, n: 16, s: 1 },
        { d: 1, n: 4, s: 1 },
      ],
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
      value: { d: 4, n: 19, s: -1 },
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
      value: { d: 1, n: 2, s: 1 },
    });
  });

  it('supports functions', async () => {
    const results = await runCode(`
      function functionname(a b) => a + b

      functionname(1, 2)
    `);

    expect(results).toMatchObject({
      type: { type: 'number' },
      value: { d: 1, n: 3, s: 1 },
    });
  });

  it('Can perform operations between columns', async () => {
    const results = await runCode(`
      Column = [ 0, 1, 2, 4 ]

      Column * [ 2, 2, 2, 3 ]
    `);

    expect(results).toMatchObject({
      type: { columnSize: 4, cellType: { type: 'number' } },
      value: [
        { d: 1, n: 0, s: 1 },
        { d: 1, n: 2, s: 1 },
        { d: 1, n: 4, s: 1 },
        { d: 1, n: 12, s: 1 },
      ],
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
        Two: { d: 1, n: 2, s: 1 },
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
      value: [
        { d: 1, n: 2, s: 1 },
        { d: 1, n: 4, s: 1 },
        { d: 1, n: 6, s: 1 },
      ],
    });

    const results2 = await runCode(`
      Column = [ 1, 2, 4 ]
      2 / Column
    `);

    expect(results2).toMatchObject({
      type: { columnSize: 3 },
      value: [
        { d: 1, n: 2, s: 1 },
        { d: 1, n: 1, s: 1 },
        { d: 2, n: 1, s: 1 },
      ],
    });
  });

  it('Can run a function with a column as only the first argument', async () => {
    const results = await runCode(`
      function multiply(A B) => A * B
      multiply([ 1, 2, 3 ], 2)
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [
        { d: 1, n: 2, s: 1 },
        { d: 1, n: 4, s: 1 },
        { d: 1, n: 6, s: 1 },
      ],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      function multiply(A B) => A * B
      multiply([ 1, 2, 3 ], [ 1, 2, 0 ])
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [
        { d: 1, n: 1, s: 1 },
        { d: 1, n: 4, s: 1 },
        { d: 1, n: 0, s: 1 },
      ],
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
      value: { d: 1, n: 1, s: 1 },
    });

    expect(
      await runCode(`
        A = if 1 > 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: { d: 1, n: 0, s: 1 },
    });
  });
});

describe('Multidimensional operations', () => {
  it('Can work on multi-d values', async () => {
    expect(
      await runCode(`
        X = { Col = [1, 2, 3] }
        Y = { Col = [100, 200] }

        (X.Col + Y.Col) + (X.Col / 10)
      `)
    ).toMatchObject({
      type: t.column(t.column(t.number(), 2, 'Y'), 3, 'X'),
      value: [
        [
          { d: 10, n: 1011, s: 1 },
          { d: 10, n: 2011, s: 1 },
        ],
        [
          { d: 5, n: 511, s: 1 },
          { d: 5, n: 1011, s: 1 },
        ],
        [
          { d: 10, n: 1033, s: 1 },
          { d: 10, n: 2033, s: 1 },
        ],
      ],
    });

    expect(
      await runCode(`
        X = { Col = [1, 2, 3] }
        Y = { Col = [100, 200] }

        (X.Col + Y.Col) + (Y.Col / 1000)
      `)
    ).toMatchObject({
      type: t.column(t.column(t.number(), 2, 'Y'), 3, 'X'),
      value: [
        [
          { d: 10, n: 1011, s: 1 },
          { d: 5, n: 1006, s: 1 },
        ],
        [
          { d: 10, n: 1021, s: 1 },
          { d: 5, n: 1011, s: 1 },
        ],
        [
          { d: 10, n: 1031, s: 1 },
          { d: 5, n: 1016, s: 1 },
        ],
      ],
    });
  });

  it('Can error during runtime if the dimensions are wrong', async () => {
    await expect(
      runCode(`
        [ [1, 2], [3, 4], [5, 6] ] + [ [100, 300, 500], [200, 400, 600] ]
      `)
    ).rejects.toBeInstanceOf(Error);
  });

  it('can run Total over multiple dims', async () => {
    expect(
      await runCode(`
        X = { Nums = [1, 2, 3] }
        total([100, 1000] * X.Nums)
      `)
    ).toMatchInlineSnapshot(`Result([ 600, 6000 ])`);

    expect(
      await runCode(`
        X = { Nums = [1, 2, 3] }
        total(([100, 1000] * X.Nums) over X)
      `)
    ).toMatchInlineSnapshot(`Result([ 1100, 2200, 3300 ])`);
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
      value: [
        { d: 1, n: 1, s: 1 },
        { d: 1, n: 2, s: 1 },
        { d: 1, n: 3, s: 1 },
      ],
    });
  });

  it('Can expand items if a column is not passed', async () => {
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
      value: [
        { d: 1, n: 1, s: 1 },
        { d: 1, n: 1, s: 1 },
        { d: 1, n: 1, s: 1 },
      ],
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
      value: [
        { d: 1, n: 1, s: 1 },
        { d: 1, n: 1, s: 1 },
        { d: 1, n: 1, s: 1 },
      ],
    });
  });

  it('can call functions with auto-expanded columns as arguments (1)', async () => {
    expect(
      await runCode(`
        Growth = {
          Period = [1, 2, 3]
          Profit = 1
          MoneyInTheBank = stepgrowth(Profit)
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Period = [ 1, 2, 3 ],
        Profit = [ 1, 1, 1 ],
        MoneyInTheBank = [ 1, 0, 0 ]
      })
    `);
  });

  it('can call functions with auto-expanded columns as arguments (2)', async () => {
    expect(
      await runCode(`
        Growth = {
          Period = [1, 2, 3]
          Profit = 500 USD + previous(0)
          MoneyInTheBank = stepgrowth(Profit)
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Period = [ 1, 2, 3 ],
        Profit = [ 500 USD, 1000 USD, 1500 USD ],
        MoneyInTheBank = [ 500 USD, 500 USD, 500 USD ]
      })
    `);
  });

  it('Can spread new tables', async () => {
    expect(
      await runCode(`
        OldTable = { Idx = ["One", "Two"] }

        NewTable = {
          ...OldTable,
          NewCol = Idx + " Apples"
        }
      `)
    ).toMatchObject({
      type: t.table({
        length: 2,
        indexName: 'OldTable',
        columnNames: ['Idx', 'NewCol'],
        columnTypes: [t.string(), t.string()],
      }),
      value: [
        ['One', 'Two'],
        ['One Apples', 'Two Apples'],
      ],
    });
  });

  it('can create a new table with a few columns', async () => {
    expect(
      await runCode(`
        SourceTable = {
          ThisOne = [1],
          NotThisOne = ["No"]
        }

        select(SourceTable, ThisOne)
      `)
    ).toMatchInlineSnapshot(`
      Result({
        ThisOne = [ 1 ]
      })
    `);
  });

  it('Can use a spread table to dictate the tables length', async () => {
    expect(
      await runCode(`
        LengthDictator = {
          Col = [1, 2, 3]
        }

        DictatedLength = {
          ...LengthDictator,
          Item = 1
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Col = [ 1, 2, 3 ],
        Item = [ 1, 1, 1 ]
      })
    `);
  });

  it('can have multidimensional columns', async () => {
    const fuelTable = (costColumn = '') => `
      Cars = { Num = [100, 200] }

      Fuel = {
        Years = [1, 2, 3]
        Cost = ${costColumn}
      }
    `;

    const result = await runCode(fuelTable('Years * Cars.Num'));
    expect(result).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ 100, 200 ], [ 200, 400 ], [ 300, 600 ] ]
      })
    `);
    expect(result.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 2 }"`
    );

    const resultInvertedDims = await runCode(fuelTable('Cars.Num * Years'));
    expect(resultInvertedDims).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ 100, 200, 300 ], [ 200, 400, 600 ] ]
      })
    `);
    expect(resultInvertedDims.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 3 }"`
    );

    const resultExtraDim = await runCode(fuelTable('Cars.Num * Years * [1]'));
    expect(resultExtraDim).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ [ 100 ], [ 200 ], [ 300 ] ], [ [ 200 ], [ 400 ], [ 600 ] ] ]
      })
    `);
    expect(resultExtraDim.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 1 x 3 }"`
    );

    const resultExtraDim2 = await runCode(fuelTable('Cars.Num * [1] * Years'));
    expect(resultExtraDim2).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ [ 100, 200, 300 ] ], [ [ 200, 400, 600 ] ] ]
      })
    `);
    expect(resultExtraDim2.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 3 x 1 }"`
    );
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
        unit: units(
          { exp: 1, known: true, multiplier: 1, unit: 'meter' },
          { exp: -1, known: true, multiplier: 1, unit: 'second' }
        ),
      },
      value: { d: 1, n: 1, s: 1 },
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
      value: { d: 1, n: 1, s: 1 },
      type: {
        unit: units(
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
          }
        ),
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
      value: { d: 1, n: 6, s: 1 },
      type: {
        unit: units({ exp: 1, known: true, multiplier: 1, unit: 'meters' }),
      },
    });

    expect(
      await runCode(`
        Speed = 6 meter/second

        Distance = Speed / 3 meter
      `)
    ).toMatchObject({
      value: { d: 1, n: 2, s: 1 },
      type: {
        unit: units({ exp: -1, known: true, multiplier: 1, unit: 'seconds' }),
      },
    });
  });

  it('can avoid converting months to seconds', async () => {
    const { type, value } = await runCode(
      '(120 meter^2) * (50 USD/meter^2/month)'
    );
    expect(type.toString()).toEqual('USD/month');
    expect(value.valueOf()).toEqual(6000);
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
          MaybeEqualMonths = [ date(2020-09), date(2020-11), date(2020-10) ],
          Days = dateequals(Months, MaybeEqualMonths)
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Months = [ month 2020-09, month 2020-10, month 2020-11 ],
        MaybeEqualMonths = [ month 2020-09, month 2020-11, month 2020-10 ],
        Days = [ true, false, false ]
      })
    `);
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

describe('number units work together', () => {
  it('handles no units', async () => {
    expect(await runCode(`1 + 2`)).toMatchObject({
      value: F(3),
      type: t.number(),
    });
  });

  it('handles unknown units', async () => {
    expect(await runCode(`1 banana + 2 bananas`)).toMatchObject({
      value: F(3),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'bananas',
            exp: 1,
            multiplier: 1,
            known: false,
          },
        ],
      }),
    });
  });

  it('handles known units', async () => {
    expect(await runCode(`1 meter + 2 meters`)).toMatchObject({
      value: F(3),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('handles known units with multipliers (1)', async () => {
    expect(
      await runCode(`
        10 centimeters
      `)
    ).toMatchObject({
      value: F(10),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 0.01,
            known: true,
          },
        ],
      }),
    });
  });

  it('handles known units without multipliers (2)', async () => {
    expect(
      await runCode(`
        2 meters + 4 meters
      `)
    ).toMatchObject({
      value: F(6),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('handles known units with multipliers (3)', async () => {
    expect(
      await runCode(`
        10 centimeters + 2 centimeters
      `)
    ).toMatchObject({
      value: F(12),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 0.01,
            known: true,
          },
        ],
      }),
    });
  });

  it('handles known units with multipliers (4)', async () => {
    expect(
      await runCode(`
        10 centimeters + 2 meters
      `)
    ).toMatchObject({
      value: F(21, 10),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('handles exponentiated known units with multipliers', async () => {
    expect(await runCode(`1 centimeters^2 + 2 meters^2`)).toMatchObject({
      value: F(20001, 10000),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 2,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('multiplies units', async () => {
    expect(await runCode(`10 kilometers * 3 hours`)).toMatchObject({
      value: F(30, 1),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'hours',
            exp: 1,
            multiplier: 1,
            known: true,
          },
          {
            unit: 'meters',
            exp: 1,
            multiplier: 1000,
            known: true,
          },
        ],
      }),
    });
  });

  it('can use divided units', async () => {
    expect(await runCode(`3 kilometers/minute`)).toMatchObject({
      value: F(3, 1),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 1000,
            known: true,
          },
          {
            unit: 'minute',
            exp: -1,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('divides two simple units', async () => {
    expect(await runCode(`3 kilometers / 1 minute`)).toMatchObject({
      value: F(3, 1),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: 1,
            multiplier: 1000,
            known: true,
          },
          {
            unit: 'minutes',
            exp: -1,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('cancels out units', async () => {
    expect(await runCode(`4 miles/hour * 2 hour`)).toMatchObject({
      value: F(8),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'miles',
            exp: 1,
            multiplier: 1,
            known: true,
          },
        ],
      }),
    });
  });

  it('does the right thing when exponentiating with units', async () => {
    expect(await runCode(`2 ** (4 as years)`)).toMatchObject({
      value: F(16),
      type: t.number(),
    });
  });

  it('has common sense about a marathon', async () => {
    expect(
      await runCode(`round(26 miles + 385 yards in meters, 1) == 1 marathon`)
    ).toMatchObject({
      value: true,
      type: t.boolean(),
    });
  });

  it.todo('is this failing because of gallons? OR because of calcs?');
  it('exponentiation works with expression as exponent', async () => {
    expect(
      await runCode(`
        Year = [date(2020) .. date(2025) by year]

        BaseFuelPrice = 4 USD/gallon

        Fuel = {
          Year,
          InterestRateFromYear = 1.08 ** ((Year - date(2020)) as years),
          Price = round(BaseFuelPrice * InterestRateFromYear, 2)
        }
      `)
    ).toMatchObject({
      value: [
        [
          1577836800000, 1609459200000, 1640995200000, 1672531200000,
          1704067200000, 1735689600000,
        ],
        [
          F(1),
          F(27, 25),
          F(729, 625),
          F(19683, 15625),
          F(531441, 390625),
          F(14348907, 9765625),
        ],
        [F(4), F(108, 25), F(467, 100), F(126, 25), F(136, 25), F(147, 25)],
      ],
    });
  });

  it('handles non-scalar unit conversions', async () => {
    expect(await runCode(`1K + 2°C + 3°F`)).toMatchObject({
      value: F(50007, 100),
      type: t.number(U('°F')),
    });
  });

  it('handles negative exp unit multipliers when converting', async () => {
    expect(await runCode(`2 liter/km * 3 km`)).toMatchObject({
      value: F(6),
      type: t.number(U('liters')),
    });
  });

  it('converts between complex units', async () => {
    expect(await runCode(`100 joules/km to calories/foot`)).toMatchObject({
      value: F(381, 52300),
      type: t.number(U([u('calories'), u('foot', { exp: -1 })])),
    });
  });

  it('converts between mixed known and unknown units', async () => {
    expect(await runCode(`1 bananas/second as bananas/minute`)).toMatchObject({
      value: F(60),
      type: t.number(
        U([u('bananas', { known: false }), u('minute', { exp: -1 })])
      ),
    });
  });

  it('autoconverts complex units', async () => {
    expect(
      await runCode(`1 joule/meter^2 + 2 calories/inch^2 as kg/second^2`)
    ).toMatchObject({
      value: F(209216129, 16129),
      type: t.number(
        U([u('g', { multiplier: 1000 }), u('second', { exp: -2 })])
      ),
    });
  });

  it('expands expandable units (1)', async () => {
    expect(await runCode(`1 squaremeter + 2 m^2`)).toMatchObject({
      value: F(3),
      type: t.number(U('m', { exp: 2 })),
    });
  });

  it('autoconverts expanding expandable units (2)', async () => {
    expect(await runCode(`1 newton/meter^2 + 2 bar`)).toMatchObject({
      value: F(200001, 100000),
      type: t.number(U('bar')),
    });
  });

  it('autoconverts expanding expandable units (3)', async () => {
    expect(await runCode(`2 bar + 1 newton/meter^2`)).toMatchObject({
      value: F(200001),
      type: t.number(U([u('newton'), u('meter', { exp: -2 })])),
    });
  });

  it('autoconverts expanding expandable units (4)', async () => {
    expect(await runCode(`2 bar + 1 newton/inch^2 as Pa`)).toMatchObject({
      value: F(3250800000, 16129),
      type: t.number(U('Pa')),
    });
  });

  it('volume expanding units', async () => {
    expect(await runCode(`(1 ft * 1 ft * 1 ft) as ft3`)).toMatchObject({
      value: F(1),
      type: t.number(U('ft3')),
    });
    expect(await runCode(`(1 inch * 1 inch * 1 inch) as in3`)).toMatchObject({
      value: F(1),
      type: t.number(U('in3')),
    });
    expect(await runCode(`(1 yd * 1 yd * 1 yd) as yd3`)).toMatchObject({
      value: F(1),
      type: t.number(U('yd3')),
    });
    expect(await runCode(`(1 mi * 1 mi * 1 mi) as cumi`)).toMatchObject({
      value: F(1),
      type: t.number(U('cumi')),
    });
  });

  it('converts to contracted unit (1)', async () => {
    expect(await runCode(`1 newtons/meter^2 in bars`)).toMatchObject({
      value: F(1, 100000),
      type: t.number(U('bars')),
    });
  });

  it('converts to contracted unit (2)', async () => {
    expect(await runCode(`10 kg*m/sec^2 in newtons`)).toMatchObject({
      value: F(10),
      type: t.number(U('newtons')),
    });
  });

  it('divides and cancels unknown units', async () => {
    expect(await runCode(`1 banana / 3 bananas`)).toMatchObject({
      value: F(1, 3),
      type: t.number(),
    });
  });

  it('divides and cancels known units', async () => {
    expect(await runCode(`1 hour / 3 hours`)).toMatchObject({
      value: F(1, 3),
      type: t.number(),
    });
  });

  it('divides and cancels time units', async () => {
    expect(await runCode(`1 hour / 3 minutes`)).toMatchObject({
      value: F(20),
      type: t.number(),
    });
  });

  it('autoconverts time units correctly', async () => {
    expect(await runCode(`1 hour / 3 minutes^2`)).toMatchObject({
      value: F(20),
      type: t.number(U('minutes', { exp: -1 })),
    });
  });

  it('multiplies units correctly (1)', async () => {
    expect(
      await runCode(`
        30 watts * 50 hours/month
      `)
    ).toMatchObject({
      value: F(1500),
      type: t.number(U([u('hours'), u('months', { exp: -1 }), u('watts')])),
    });
  });

  it('multiplies units correctly (2)', async () => {
    expect(
      await runCode(`
        2 usd/watt * 3 watt
      `)
    ).toMatchObject({
      value: F(6),
      type: t.number(U([u('usd')])),
    });
  });

  it('multiplies units correctly (3.1)', async () => {
    expect(
      await runCode(`
        2 usd/watt/hour * 3 watt
      `)
    ).toMatchObject({
      value: F(6),
      type: t.number(U([u('hours', { exp: -1 }), u('usd')])),
    });
  });

  it('multiplies units correctly (3.2)', async () => {
    expect(
      await runCode(`
      3 watt * 2 usd/watt/hour
      `)
    ).toMatchObject({
      value: F(6),
      type: t.number(U([u('hours', { exp: -1 }), u('usd')])),
    });
  });

  it('multiplies units correctly (4)', async () => {
    expect(
      await runCode(`
        1500 watt*hours/month * 1 usd/watt/hour
      `)
    ).toMatchObject({
      value: F(1500),
      type: t.number(U([u('months', { exp: -1 }), u('usd')])),
    });
  });

  it('multiplies units correctly (5)', async () => {
    expect(
      await runCode(`
        round(30 gallons * 1.4 * 100 USD/gallon, 2)
      `)
    ).toMatchObject({
      value: F(4200),
      type: t.number(U('USD')),
    });
  });

  it('multiplies units correctly inside a table formula', async () => {
    expect(
      await runCode(`
        Fuel = {
          Seq = [0, 1]
          InterestRate = 1.08 ** Seq
          Price = 4 USD/gallon * InterestRate
        }
      `)
    ).toMatchObject({
      value: [
        [F(0), F(1)], // YearSeq
        [F(1), F(27, 25)], // InterestRate
        [F(4), F(432, 100)], // Price
      ],
      type: t.table({
        indexName: 'Fuel',
        length: 2,
        columnTypes: [
          t.number(),
          t.number(),
          t.number(U([u('USD'), u('gallons', { exp: -1 })])),
        ],
        columnNames: ['Seq', 'InterestRate', 'Price'],
      }),
    });
  });
});

describe('units work on columns', () => {
  it('as can be applied to columns', async () => {
    expect(
      await runCode(`
        [1, 2, 3] as watts
      `)
    ).toMatchObject({
      value: [F(1), F(2), F(3)],
      type: t.column(t.number(U('watts')), 3),
    });
  });
});
