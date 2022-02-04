// E2e tests
import Fraction from '@decipad/fraction';
import { build as t, units } from './type';
import { runCode } from './run';
import {
  runCodeForVariables,
  objectToTableType,
  objectToTableValue,
  resultSnapshotSerializer,
  runAST,
} from './testUtils';
import { date, parseUTCDate } from './date';
import { Column, Scalar } from './interpreter/Value';
import { block, n, F, U, u, c } from './utils';
import { number } from './type/build';

expect.addSnapshotSerializer(resultSnapshotSerializer);

describe('basic code', () => {
  it('runs basic operations', async () => {
    expect(
      await runCode(`
        [
          1 + 1,
          -1,
          55 % 2,
          101%,
          1/4,
          2^4,
          sqrt(16)
        ]
      `)
    ).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [F(2), F(-1), F(1), F(101, 100), F(1, 4), F(16), F(4)],
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

  it('boolean ops support dates', async () => {
    const eq = c('==', date('2021-01', 'month'), date('2021-01', 'month'));

    expect(await runAST(block(eq))).toMatchInlineSnapshot(`Result(true)`);
  });

  it('boolean ops support booleans', async () => {
    expect(
      await runCode(`
        [
          true == true,
          false != true,
          false == false
        ]
      `)
    ).toMatchInlineSnapshot(`Result([ true, true, true ])`);
  });

  it('has correct operator precedence', async () => {
    expect(await runCode('1 + 2 / 4 - 5 ** 2 / 4')).toMatchObject({
      type: { type: 'number' },
      value: F(-19, 4),
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
      value: F(2),
    });
  });

  it('supports functions', async () => {
    const results = await runCode(`
      functionname(a b) = a + b

      functionname(1, 2)
    `);

    expect(results).toMatchObject({
      type: { type: 'number' },
      value: F(3),
    });
  });

  it('supports lexical scoping', async () => {
    expect(
      await runCode(`
        Variable = "expect this"

        Function(Arg) = Variable == "expect this"
        OnceRemoved(Variable) = Function(1)

        [Variable == "expect this", OnceRemoved("do not expect this")]
      `)
    ).toMatchInlineSnapshot(`Result([ true, true ])`);
  });

  it('Can perform operations between columns', async () => {
    const results = await runCode(`
      Column = [ 0, 1, 2, 4 ]

      Column * [ 2, 2, 2, 3 ]
    `);

    expect(results).toMatchObject({
      type: { columnSize: 4, cellType: { type: 'number' } },
      value: [F(0), F(2), F(4), F(12)],
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
        Two: F(2),
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
      value: [F(2), F(4), F(6)],
    });

    const results2 = await runCode(`
      Column = [ 1, 2, 4 ]
      2 / Column
    `);

    expect(results2).toMatchObject({
      type: { columnSize: 3 },
      value: [F(2), F(1), F(1, 2)],
    });
  });

  it('Can run a function with a column as only the first argument', async () => {
    const results = await runCode(`
      multiply(A B) = A * B
      multiply([ 1, 2, 3 ], 2)
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [F(2), F(4), F(6)],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      multiply(A B) = A * B
      multiply([ 1, 2, 3 ], [ 1, 2, 0 ])
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [F(1), F(4), F(0)],
    });
  });

  it.todo('TODO: Does not allow empty columns');

  it('supports conditions', async () => {
    expect(
      await runCode(`
        if 1 < 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: F(1),
    });

    expect(
      await runCode(`
        if 1 > 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: F(0),
    });
  });

  it('conditions branches can be of any type', async () => {
    expect(
      await runCode(`
        TableCorrect = { Correct = [true] }
        TableWrong = { Correct = [false] }
        if 1 < 3 then TableCorrect else TableWrong
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Correct = [ true ]
      })
    `);
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
      type: t.column(t.column(t.number(), 2, 'Y', 0), 3, 'X', 0),
      value: [
        [F(1011, 10), F(2011, 10)],
        [F(511, 5), F(1011, 5)],
        [F(1033, 10), F(2033, 10)],
      ],
    });

    expect(
      await runCode(`
        X = { Col = [1, 2, 3] }
        Y = { Col = [100, 200] }

        (X.Col + Y.Col) + (Y.Col / 1000)
      `)
    ).toMatchObject({
      type: t.column(t.column(t.number(), 2, 'Y', 0), 3, 'X', 0),
      value: [
        [F(1011, 10), F(1006, 5)],
        [F(1021, 10), F(1011, 5)],
        [F(1031, 10), F(1016, 5)],
      ],
    });
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
      await runCode(
        `Table = { Column1 = [1.1, 2.2, 3.3], Column2 = Column1 * 2 }`
      )
    ).toMatchObject({
      type: objectToTableType('Table', 3, {
        Column1: t.number(),
        Column2: t.number(),
      }),
      value: objectToTableValue({
        Column1: [F(11, 10), F(22, 10), F(33, 10)],
        Column2: [F(22, 10), F(44, 10), F(66, 10)],
      }),
    });
  });

  it('can refer to the previous thing', async () => {
    expect(
      await runCode(`
        Table = {
          Column1 = [1.1, 2.2, 3.3],
          Column2 = Column1 + previous(0)
        }
      `)
    ).toEqual({
      type: objectToTableType('Table', 3, {
        Column1: t.number(),
        Column2: t.number(),
      }),
      value: objectToTableValue({
        Column1: [F(11, 10), F(22, 10), F(33, 10)],
        Column2: [F(11, 10), F(33, 10), F(66, 10)],
      }),
    });
  });

  it('can refer to another column as a cell', async () => {
    expect(
      await runCode(`
        Table = {
          Index = [1, 2, 3, 4]
          Cell = max([Index, 2])
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Index = [ 1, 2, 3, 4 ],
        Cell = [ 2, 2, 3, 4 ]
      })
    `);
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
      value: objectToTableValue({
        Column1: [F(1), F(2), F(3)],
        Column2: [new Fraction(1, 2), 1n, new Fraction(3, 2)],
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
      type: t.column(t.number(), 3, 'Table', 0),
      value: [F(1), F(2), F(3)],
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
      type: t.column(t.number(), 3, 'Table', 1),
      value: [F(1), F(1), F(1)],
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
      type: t.column(t.number(), 3, 'Table', 0),
      value: [F(1), F(1), F(1)],
    });
  });

  it('can call functions with auto-expanded columns as arguments (1)', async () => {
    expect(
      await runCode(`
        Growth = {
          Period = [1, 2, 3]
          Profit = 1
          MoneyInTheBank = stepgrowth(Growth.Profit)
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

  it('Regression: tables inside tables', async () => {
    expect(
      await runCode(`
        A = { B = [1,2,3] }
        C = { A = A }
        C.A
      `)
    ).toMatchInlineSnapshot(`
      Result([ {
        B = [ 1, 2, 3 ]
      } ])
    `);
  });

  it('can call functions with auto-expanded columns as arguments (2)', async () => {
    expect(
      await runCode(`
        Growth = {
          Period = [1, 2, 3]
          Profit = 500 USD + previous(0)
          MoneyInTheBank = stepgrowth(Growth.Profit)
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Period = [ 1, 2, 3 ],
        Profit = [ 500 $, 1000 $, 1500 $ ],
        MoneyInTheBank = [ 500 $, 500 $, 500 $ ]
      })
    `);
  });

  it('can create per-cell formulae', async () => {
    expect(
      await runCode(`
        Table = {
          Column = [1, 2, 0, 0, 3, -3, -3]
          CumulativeSum = Column + previous(0)
        }
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Column = [ 1, 2, 0, 0, 3, -3, -3 ],
        CumulativeSum = [ 1, 3, 3, 3, 6, 3, 0 ]
      })
    `);

    await expect(
      runCode(`
        Table = {
          Index = [1,2,3]
          CannotAccessNextCol = NotYet + 1 meter
          NotYet = [1, 2, 3]
        }
      `)
    ).rejects.not.toBeNull();
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

    const result = await runCode(fuelTable('Fuel.Years * Cars.Num'));
    expect(result).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ 100, 200 ], [ 200, 400 ], [ 300, 600 ] ]
      })
    `);
    expect(result.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 2 }"`
    );

    const resultInvertedDims = await runCode(
      fuelTable('Cars.Num * Fuel.Years')
    );
    expect(resultInvertedDims).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ 100, 200, 300 ], [ 200, 400, 600 ] ]
      })
    `);
    expect(resultInvertedDims.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 3 }"`
    );

    const resultExtraDim = await runCode(
      fuelTable('Cars.Num * Fuel.Years * [1]')
    );
    expect(resultExtraDim).toMatchInlineSnapshot(`
      Result({
        Years = [ 1, 2, 3 ],
        Cost = [ [ [ 100 ], [ 200 ], [ 300 ] ], [ [ 200 ], [ 400 ], [ 600 ] ] ]
      })
    `);
    expect(resultExtraDim.type.toString()).toMatchInlineSnapshot(
      `"table (3) { Years = <number>, Cost = <number> x 1 x 3 }"`
    );

    const resultExtraDim2 = await runCode(
      fuelTable('Cars.Num * [1] * Fuel.Years')
    );
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

  it('Regression: splitby + lookup issue', async () => {
    expect(
      await runCode(`
        Table = {
          Name = ["Ava", "Eva", "Adam"],
          Country = ["🇵🇹", "🇬🇧", "🇬🇧"]
        }
        Countries = splitby(Table, Table.Country)
        lookup(Countries, Countries.Country == "🇬🇧")
      `)
    ).toMatchInlineSnapshot(`
      Result({
        Country = '🇬🇧',
        Values = {
        Name = [ 'Eva', 'Adam' ]
      }
      })
    `);
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
          {
            exp: F(1),
            known: true,
            multiplier: new Fraction(1),
            unit: 'meters',
          },
          {
            exp: F(-1),
            known: true,
            multiplier: new Fraction(1),
            unit: 'seconds',
          }
        ),
      },
      value: F(1),
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
      value: F(1),
      type: {
        unit: units(
          {
            exp: F(1),
            known: true,
            multiplier: new Fraction(1),
            unit: 'meters',
          },
          {
            exp: F(-1),
            known: true,
            multiplier: new Fraction(1),
            unit: 'seconds',
          }
        ),
      },
    });
  });

  it('units can be collapsed (1)', async () => {
    expect(
      await runCode(`
        Speed = 2 meter/second

        Distance = Speed * 3 second
      `)
    ).toMatchObject({
      value: F(6),
      type: {
        unit: units({
          exp: F(1),
          known: true,
          multiplier: new Fraction(1),
          unit: 'meters',
        }),
      },
    });
  });

  it('units can be collapsed (2)', async () => {
    expect(
      await runCode(`
        Speed = 6 meter/second

        Frequency = Speed / (3 meter)
      `)
    ).toMatchObject({
      value: F(2),
      type: {
        unit: units({
          exp: F(-1),
          known: true,
          multiplier: new Fraction(1),
          unit: 'seconds',
        }),
      },
    });
  });

  it('can avoid converting months to seconds', async () => {
    const { type, value } = await runCode(
      '(120 meter^2) * (50 USD/meter^2/month)'
    );
    expect(type.toString()).toEqual('$ per month');
    expect(value.valueOf()).toEqual(6000);
  });
});

describe('Ranges', () => {
  it('Evaluates and types ranges', async () => {
    expect(
      await runCode(`
        Range = range(1..3)
        Containment = Range contains 3
      `)
    ).toMatchObject({
      type: { type: 'boolean' },
      value: true,
    });
  });

  it('can use contain on range', async () => {
    expect(await runCode(`(range(1 .. 10)) contains 5`)).toMatchObject({
      type: { type: 'boolean' },
      value: true,
    });
  });

  it('reserves the word "range"', async () => {
    await expect(runCode('range + 1')).rejects.toBeDefined();
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

  it('can get the max of a list of dates', async () => {
    expect(
      await runCode(`max([date(2050-Jan-01), date(2025-Jun-01)])`)
    ).toMatchInlineSnapshot(`Result(day 2050-01-01)`);
  });

  it('can operate between dates', async () => {
    expect(await runCode(`date(2020) - date(2010)`)).toMatchInlineSnapshot(
      `Result(10 years)`
    );
    expect(
      await runCode(`date(2020-01) - date(2010-01)`)
    ).toMatchInlineSnapshot(`Result(120 months)`);
    expect(
      await runCode(`date(2020-01-01) - date(2010-01-01)`)
    ).toMatchInlineSnapshot(`Result(3652 days)`);
    expect(
      await runCode(`date(2020-01-01T10:30) - date(2020-01-01T09:30)`)
    ).toMatchInlineSnapshot(`Result(60 minutes)`);
    expect(
      await runCode(`date(2020-01-01T10:30:16) - date(2020-01-01T10:30:00)`)
    ).toMatchInlineSnapshot(`Result(16 seconds)`);

    expect(await runCode(`1 year + date(2020)`)).toMatchInlineSnapshot(
      `Result(year 2021)`
    );
    expect(await runCode(`date(2020-01) + 12 months`)).toMatchInlineSnapshot(
      `Result(month 2021-01)`
    );
    expect(await runCode(`date(2020-01) + 1 year`)).toMatchInlineSnapshot(
      `Result(month 2021-01)`
    );
    expect(
      await runCode(`[ date(2020-01) ] + [ 1 year ]`)
    ).toMatchInlineSnapshot(`Result([ month 2021-01 ])`);
    expect(
      await runCode(`date(2020-01-01T10:30:16) - 16 seconds`)
    ).toMatchInlineSnapshot(`Result(second 2020-01-01 10:30)`);
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
            exp: F(1),
            multiplier: new Fraction(1),
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
            exp: F(1),
            multiplier: new Fraction(1),
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
            exp: F(1),
            multiplier: new Fraction(0.01),
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
            exp: F(1),
            multiplier: new Fraction(1),
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
            exp: F(1),
            multiplier: new Fraction(0.01),
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
            exp: F(1),
            multiplier: new Fraction(1),
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
            exp: F(2),
            multiplier: new Fraction(1),
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
            unit: 'meters',
            exp: F(1),
            multiplier: new Fraction(1000),
            known: true,
          },
          {
            unit: 'hours',
            exp: F(1),
            multiplier: new Fraction(1),
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
            exp: F(1),
            multiplier: new Fraction(1000),
            known: true,
          },
          {
            unit: 'minutes',
            exp: F(-1),
            multiplier: new Fraction(1),
            known: true,
          },
        ],
      }),
    });
  });

  it('divides two simple units', async () => {
    expect(await runCode(`3 kilometers / ( 1 minute )`)).toMatchObject({
      value: F(3, 1),
      type: t.number({
        type: 'units',
        args: [
          {
            unit: 'meters',
            exp: F(1),
            multiplier: new Fraction(1000),
            known: true,
          },
          {
            unit: 'minutes',
            exp: F(-1),
            multiplier: new Fraction(1),
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
            exp: F(1),
            multiplier: new Fraction(1),
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

  it('calculates date difference', async () => {
    expect(await runCode(`date(2021) - date(2020)`)).toMatchObject({
      value: new Fraction(1),
      type: t.number(U('year')),
    });
  });

  it('calculates date sequence', async () => {
    expect(await runCode(`[date(2020) .. date(2025) by year]`)).toMatchObject({
      value: [
        1577836800000n,
        1609459200000n,
        1640995200000n,
        1672531200000n,
        1704067200000n,
        1735689600000n,
      ],
      type: t.column(t.date('year'), 6),
    });
  });

  it('calculates number from time quantity', async () => {
    expect(await runCode(`(date(2021) - date(2020)) as years`)).toMatchObject({
      value: F(1),
      type: number(U('years')),
    });
  });

  it('calculates number from time quantity decade', async () => {
    expect(await runCode(`(date(2040) - date(2030)) as decade`)).toMatchObject({
      value: F(1),
      type: number(U('decade')),
    });
  });

  it('calculates number from time quantity century', async () => {
    expect(await runCode(`(date(2130) - date(2030)) as century`)).toMatchObject(
      {
        value: F(1),
        type: number(U('century')),
      }
    );
  });

  it('calculates number from time quantity millennia', async () => {
    expect(
      await runCode(`(date(4000) - date(1000)) as millennia`)
    ).toMatchObject({
      value: F(3),
      type: number(U('millennia')),
    });
  });

  it('calculates number from time quantity millenniums', async () => {
    expect(
      await runCode(`(date(8000) - date(1000)) as millenniums`)
    ).toMatchObject({
      value: F(7),
      type: number(U('millenniums')),
    });
  });

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
          1577836800000n,
          1609459200000n,
          1640995200000n,
          1672531200000n,
          1704067200000n,
          1735689600000n,
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
      // 1 + (2 + 273.15) + ((3 - 32) * 5 / 9 + 273.15)
      // = 1 + 275.15 + 257.03(8) =  533.18(8)
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
      type: t.number(U([u('calories'), u('feet', { exp: F(-1) })])),
    });
  });

  it('converts between mixed known and unknown units', async () => {
    expect(await runCode(`1 bananas/second as bananas/minute`)).toMatchObject({
      value: F(60),
      type: t.number(
        U([u('bananas', { known: false }), u('minutes', { exp: F(-1) })])
      ),
    });
  });

  it('autoconverts complex units', async () => {
    expect(
      await runCode(`1 joule/meter^2 + 2 calories/inch^2 as kg/second^2`)
    ).toMatchObject({
      value: F(209216129, 16129),
      type: t.number(
        U([
          u('g', { multiplier: new Fraction(1000) }),
          u('seconds', { exp: F(-2) }),
        ])
      ),
    });
  });

  it('expands expandable units (1)', async () => {
    expect(await runCode(`1 squaremeter + 2 m^2`)).toMatchObject({
      value: F(3),
      type: t.number(U('m', { exp: F(2) })),
    });
  });

  it('autoconverts expanding expandable units (2)', async () => {
    expect(await runCode(`1 newton/meter^2 + 2 bar`)).toMatchObject({
      value: F(200001, 100000),
      type: t.number(U('bars')),
    });
  });

  it('autoconverts expanding expandable units (3)', async () => {
    expect(await runCode(`2 bar + 1 newton/meter^2`)).toMatchObject({
      value: F(200001),
      type: t.number(U([u('meters', { exp: F(-2) }), u('newtons')])),
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

  it('should convert joules into kw hour', async () => {
    const run = await runCode(`3600 kj in kw h`);

    expect(run).toMatchObject({
      value: F(1),
      type: t.number(U([u('w', { multiplier: new Fraction(1000) }), u('h')])),
    });
  });

  it('should convert 1cm into mm', async () => {
    const run = await runCode(`1 cm in mm`);

    expect(run).toMatchObject({
      value: F(10),
      type: t.number(U([u('m', { multiplier: new Fraction(0.001) })])),
    });
  });

  it('should convert 1 decimetre into centimetre', async () => {
    const run = await runCode(`1 decimetre in centimetre`);

    expect(run).toMatchObject({
      value: F(10),
      type: t.number(U([u('metre', { multiplier: new Fraction(0.01) })])),
    });
  });

  it('should convert 1 cm into millimetre', async () => {
    const run = await runCode(`1 cm in millimetre`);

    expect(run).toMatchObject({
      value: F(10),
      type: t.number(U([u('metre', { multiplier: new Fraction(1, 1000) })])),
    });
  });

  it('should convert 1mm into nm', async () => {
    const run = await runCode(`1 mm in nm`);

    expect(run).toMatchObject({
      value: F(1_000_000),
      type: t.number(
        U([u('m', { multiplier: new Fraction(1, 1_000_000_000) })])
      ),
    });
  });

  it('should convert 1mm into μm', async () => {
    const run = await runCode(`1 mm in μm`);

    expect(run).toMatchObject({
      value: F(1_000),
      type: t.number(U([u('m', { multiplier: new Fraction(0.000001) })])),
    });
  });

  it('should calculate 1cF + 1cF', async () => {
    const run = await runCode(`1 cF + 1 cF`);

    expect(run).toMatchObject({
      value: F(2),
      type: t.number(U([u('F', { multiplier: new Fraction(1, 100) })])),
    });
  });

  it('should calculate 1 centifarad + 1 centifarad', async () => {
    const run = await runCode(`1 centifarad + 1 centifarad`);

    expect(run).toMatchObject({
      value: F(2),
      type: t.number(U([u('farads', { multiplier: new Fraction(1, 100) })])),
    });
  });

  it('converts to contracted unit (2)', async () => {
    expect(await runCode(`10 kg*m/sec^2 in newtons`)).toMatchObject({
      value: F(10),
      type: t.number(U('newtons')),
    });
  });

  it('divides and cancels unknown units', async () => {
    expect(await runCode(`1 banana / ( 3 bananas )`)).toMatchObject({
      value: F(1, 3),
      type: t.number(),
    });
  });

  it('divides and cancels known units', async () => {
    expect(await runCode(`1 hour / ( 3 hours )`)).toMatchObject({
      value: F(1, 3),
      type: t.number(),
    });
  });

  it('divides and cancels time units', async () => {
    expect(await runCode(`1 hour / ( 3 minutes )`)).toMatchObject({
      value: F(20),
      type: t.number(),
    });
  });

  it('autoconverts time units correctly', async () => {
    expect(await runCode(`1 hour / ( 3 minutes^2 )`)).toMatchObject({
      value: F(20),
      type: t.number(U('minutes', { exp: F(-1) })),
    });
  });

  it('multiplies units correctly (1)', async () => {
    expect(
      await runCode(`
        30 watts * 50 hours/month
      `)
    ).toMatchObject({
      value: F(1500),
      type: t.number(U([u('hours'), u('months', { exp: F(-1) }), u('watts')])),
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
      type: t.number(U([u('hours', { exp: F(-1) }), u('usd')])),
    });
  });

  it('multiplies units correctly (3.2)', async () => {
    expect(
      await runCode(`
      3 watt * 2 usd/watt/hour
      `)
    ).toMatchObject({
      value: F(6),
      type: t.number(U([u('hours', { exp: F(-1) }), u('usd')])),
    });
  });

  it('multiplies units correctly (4)', async () => {
    expect(
      await runCode(`
        1500 watt*hours/month * 1 usd/watt/hour
      `)
    ).toMatchObject({
      value: F(1500),
      type: t.number(U([u('months', { exp: F(-1) }), u('usd')])),
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

  it('autoconverts units', async () => {
    expect(await runCode(`30 psi + 1 newton/inch^2`)).toMatchObject({
      value: F(197582111, 1469600),
      type: t.number(U([u('inches', { exp: F(-2) }), u('newtons')])),
    });

    expect(await runCode(`30 bar + 100000 N/m^2`)).toMatchObject({
      value: F(3100000),
      type: t.number(U([u('N'), u('m', { exp: F(-2) })])),
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
          t.number(U([u('USD'), u('gallons', { exp: F(-1) })])),
        ],
        columnNames: ['Seq', 'InterestRate', 'Price'],
      }),
    });
  });

  it("nonscalar unit conversions don't get in the way", async () => {
    expect(await runCode(`44 zettabytes/year`)).toMatchObject({
      value: F(44),
      type: t.number(
        U([u('bytes', { multiplier: F(1e21) }), u('years', { exp: F(-1) })])
      ),
    });
  });
});

describe('unit conversion', () => {
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

  it('can work accross multi-dimensional operations (1)', async () => {
    expect(
      await runCode(`
        Animals = {
          Name = ["Person", "Falcon", "Turtle"]
          Speed = [27.33 mph, 55 mph, 22 mph]
        }

        Race = {
          Name = ["Quarter", "Half", "Marathon"]
          Distance = [0.25 marathon, 0.5 marathon, 1 marathon]
        }

        Hours = sum(Race.Distance / Animals.Speed over Animals) in hours
      `)
    ).toMatchObject({
      value: [
        F(307671875, 183264048),
        F(2461375, 2950464),
        F(12306875, 5900928),
      ],
      type: t.column(t.number(U('hours')), 3, 'Animals'),
    });
  });

  it('can work accross multi-dimensional operations (2)', async () => {
    expect(
      await runCode(`
        Animals = {
          Name = ["Person", "Falcon"]
          Speed = [27.33 miles/hour, 55 miles/hour]
        }

        Animals2 = {
          Name = Animals.Name
          Speed = [27.33 mph, 55 mph]
        }

        Animals3 = {
          Name = Animals.Name
          Speed = [27.33 miles/hour in kilometer/second, 55 miles/hour in kilometer/second]
        }

        Race = {
          Name = ["Quarter", "Half", "Marathon"]
          Distance = [0.25 marathon, 0.5 marathon, 1 marathon]
        }

        Hours = round(sum(1/(Animals.Speed / Race.Distance) in hours), 2)
        Hours2 = round(sum(1/(Animals2.Speed / Race.Distance) in hours), 2)
        Hours3 = round(sum(1/(Animals3.Speed / Race.Distance) in hours), 2)


        [Hours, Hours2, Hours3]
    `)
    ).toMatchInlineSnapshot(
      `Result([ [ 1.68 hours, 0.83 hours ], [ 1.68 hours, 0.83 hours ], [ 1.68 hours, 0.83 hours ] ])`
    );
  });
});

describe('user-defined units', () => {
  it('a unit can be defined by the user', async () => {
    expect(
      await runCode(`
      nuno = 100 kg
      2 tonnes in nuno
    `)
    ).toMatchObject({
      value: F(20),
      type: t.number(U('nuno', { known: false })),
    });
  });

  it('a user unit can be defined on another user unit', async () => {
    expect(
      await runCode(`
        nuno = 100 kg
        fatnuno = 2 nuno
        2 tonnes in fatnuno
      `)
    ).toMatchObject({
      value: F(10),
      type: t.number(U('fatnuno', { known: false })),
    });
  });

  it('user-defined units auto-convert', async () => {
    expect(
      await runCode(`
        FlourDensity = 0.8 g/ml
        FlourDensity * 1 cup
      `)
    ).toMatchObject({
      value: F(200),
      type: t.number(U('g')),
    });
  });
});

describe('math operators', () => {
  it('rounds number', async () => {
    expect(await runCode(`round(1.7 grams)`)).toMatchObject({
      value: F(2),
      type: t.number(U('grams')),
    });
  });
  it('rounds a list of numbers', async () => {
    expect(await runCode(`round([1.7 grams, 3.4 grams])`)).toMatchObject({
      value: [F(2), F(3)],
      type: t.column(t.number(U('grams')), 2),
    });
  });
  it('rounds a list of lists of numbers', async () => {
    expect(await runCode(`round([[1.7 grams, 3.4 grams]])`)).toMatchObject({
      value: [[F(2), F(3)]],
      type: t.column(t.column(t.number(U('grams')), 2), 1),
    });
  });
  it('sqrt works on units', async () => {
    expect(await runCode(`sqrt(1 banana)`)).toMatchObject({
      value: F(1),
      type: t.number(U('bananas', { known: false, exp: F(1, 2) })),
    });
  });
  it('sqrt works on non-rational results by approximation', async () => {
    expect(await runCode(`sqrt(60 m / (9.8m) / s^2)`)).toMatchObject({
      value: F(9032400, 3650401),
      type: t.number(U('s', { exp: F(-1) })),
    });
  });
});

describe('len', () => {
  it('len a column of dates', async () => {
    expect(await runCode(`len(date(2020))`)).toMatchObject({
      value: F(1),
      type: t.number(U('year')),
    });
    expect(await runCode(`len([date(2020), date(2021)])`)).toMatchObject({
      value: F(2),
      type: t.number(U('year')),
    });
  });
});
