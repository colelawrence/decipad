// E2e tests
import { N } from '@decipad/number';
import { date, parseUTCDate } from './date';
import { runCode } from './run';
import {
  objectToTableType,
  objectToTableValue,
  runAST,
  runCodeForVariables,
  typeSnapshotSerializer,
} from './testUtils';
import { buildType as t, InferError, serializeType } from './type';
import { number } from './type/buildType';
import { block, c, n, U, u } from './utils';
import { materializeOneResult } from './utils/materializeOneResult';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('basic code', () => {
  it('runs basic operations', async () => {
    expect(
      await runCode(`
        [
          1 + 1,
          -1,
          55 mod 2,
          101%,
          1000‰,
          10000‱,
          1/4,
          2^4,
          sqrt(16)
        ]
      `)
    ).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [N(2), N(-1), N(1), N(101, 100), N(1), N(1), N(1, 4), N(16), N(4)],
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

    expect(await runAST(block(eq))).toMatchObject({
      type: { type: 'boolean' },
      value: true,
    });
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
    ).toMatchObject({
      type: { cellType: { type: 'boolean' } },
      value: [true, true, true],
    });
  });

  it('has correct operator precedence', async () => {
    expect(await runCode('1 + 2 / 4 - 5 ** 2 / 4')).toMatchObject({
      type: { type: 'number' },
      value: N(-19, 4),
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
      value: N(2),
    });
  });

  it('supports functions', async () => {
    const results = await runCode(`
      functionname(a c) = a + c

      functionname(1, 2)
    `);

    expect(results).toMatchObject({
      type: { type: 'number' },
      value: N(3),
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
    ).toMatchObject({
      type: { cellType: { type: 'boolean' } },
      value: [true, true],
    });
  });

  it('Can perform operations between columns', async () => {
    const results = await runCode(`
      Column = [ 0, 1, 2, 4 ]

      Column * [ 2, 2, 2, 3 ]
    `);

    expect(results).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [N(0), N(2), N(4), N(12)],
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
        Two: N(2),
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
      type: { cellType: { type: 'number' } },
      value: [N(2), N(4), N(6)],
    });

    const results2 = await runCode(`
      Column = [ 1, 2, 4 ]
      2 / Column
    `);

    expect(results2).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [N(2), N(1), N(1, 2)],
    });
  });

  it('Can run a function with a column as only the first argument', async () => {
    const results = await runCode(`
      multiply(A C) = A * C
      multiply([ 1, 2, 3 ], 2)
    `);

    expect(results).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [N(2), N(4), N(6)],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      multiply(A C) = A * C
      multiply([ 1, 2, 3 ], [ 1, 2, 0 ])
    `);

    expect(results).toMatchObject({
      type: { cellType: { type: 'number' } },
      value: [N(1), N(4), N(0)],
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
      value: N(1),
    });

    expect(
      await runCode(`
        if 1 > 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { type: 'number' },
      value: N(0),
    });
  });

  it('conditions branches can be of any type', async () => {
    expect(
      await runCode(`
        TableCorrect = { Correct = [true] }
        TableWrong = { Correct = [false] }
        if 1 < 3 then TableCorrect else TableWrong
      `)
    ).toMatchObject({
      type: {
        columnNames: ['Correct'],
        columnTypes: [{ type: 'boolean' }],
      },
      value: [[true]],
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
      type: t.column(t.column(t.number(), 'Y', 0), 'X', 0),
      value: [
        [N(1011, 10), N(2011, 10)],
        [N(511, 5), N(1011, 5)],
        [N(1033, 10), N(2033, 10)],
      ],
    });

    expect(
      await runCode(`
        X = { Col = [1, 2, 3] }
        Y = { Col = [100, 200] }

        (X.Col + Y.Col) + (Y.Col / 1000)
      `)
    ).toMatchObject({
      type: t.column(t.column(t.number(), 'Y', 0), 'X', 0),
      value: [
        [N(1011, 10), N(1006, 5)],
        [N(1021, 10), N(1011, 5)],
        [N(1031, 10), N(1016, 5)],
      ],
    });
  });

  it('can run Total over multiple dims', async () => {
    expect(
      await runCode(`
        X = { Nums = [1, 2, 3] }
        total([100, 1000] * X.Nums)
      `)
    ).toMatchObject({
      type: {
        cellType: {
          type: 'number',
        },
      },
      value: [N(600), N(6000)],
    });

    expect(
      await runCode(`
        X = { Nums = [1, 2, 3] }
        total(([100, 1000] * X.Nums) over X)
      `)
    ).toMatchObject({
      type: {
        cellType: {
          type: 'number',
        },
      },
      value: [N(1100), N(2200), N(3300)],
    });
  });

  it('errors when not 1D', async () => {
    await expect(
      runCode(`total(1)`)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"panic: cardinality is too low"`
    );
    await expect(
      runCode(`cat(1, 1)`)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"panic: one or more cardinalities are too low"`
    );
  });
});

describe('Tables', () => {
  it('can be created', async () => {
    expect(
      await runCode(
        `Table = { Column1 = [1.1, 2.2, 3.3], Column2 = Column1 * 2 }`
      )
    ).toMatchObject({
      type: await objectToTableType('Table', {
        Column1: t.number(),
        Column2: t.number(),
      }),
      value: await materializeOneResult(
        objectToTableValue({
          Column1: [N(11, 10), N(22, 10), N(33, 10)],
          Column2: [N(22, 10), N(44, 10), N(66, 10)],
        })
      ),
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
      type: objectToTableType('Table', {
        Column1: t.number(),
        Column2: t.number(),
      }),
      value: await materializeOneResult(
        objectToTableValue({
          Column1: [N(11, 10), N(22, 10), N(33, 10)],
          Column2: [N(11, 10), N(33, 10), N(66, 10)],
        })
      ),
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
    ).toMatchObject({
      type: { columnNames: ['Index', 'Cell'] },
      value: [
        [N(1), N(2), N(3), N(4)],
        [N(2), N(2), N(3), N(4)],
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
      type: objectToTableType('Table', {
        Column1: t.number(),
        Column2: t.number(),
        Column3: t.boolean(),
      }),
      value: await materializeOneResult(
        objectToTableValue({
          Column1: [N(1), N(2), N(3)],
          Column2: [N(1, 2), 1n, N(3, 2)],
          Column3: [false, false, true],
        })
      ),
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
      type: t.column(t.number(), 'Table', 0),
      value: [N(1), N(2), N(3)],
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
      type: t.column(t.number(), 'Table', 1),
      value: [N(1), N(1), N(1)],
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
    ).toMatchObject({
      type: {
        columnNames: ['Period', 'Profit', 'MoneyInTheBank'],
        columnTypes: [
          { type: 'number' },
          { type: 'number' },
          { type: 'number' },
        ],
      },
      value: [
        [N(1), N(2), N(3)],
        [N(1), N(1), N(1)],
        [N(1), N(0), N(0)],
      ],
    });
  });

  it('Regression: tables inside tables', async () => {
    expect(
      await runCode(`
        A = { B = [1,2,3] }
        C = { A = A }
        C.A
      `)
    ).toMatchObject({
      type: {
        cellType: {
          columnNames: ['B'],
          columnTypes: [{ type: 'number' }],
        },
        indexedBy: 'C',
      },
      value: [[[N(1), N(2), N(3)]]],
    });
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
    ).toMatchObject({
      type: {
        columnNames: ['Period', 'Profit', 'MoneyInTheBank'],
        columnTypes: [
          { type: 'number' },
          { type: 'number', unit: U('USD', { known: true }) },
          { type: 'number', unit: U('USD', { known: true }) },
        ],
      },
      value: [
        [N(1), N(2), N(3)],
        [N(500), N(1000), N(1500)],
        [N(500), N(500), N(500)],
      ],
    });
  });

  it('can create per-cell formulae', async () => {
    expect(
      await runCode(`
        Table = {
          Column = [1, 2, 0, 0, 3, -3, -3]
          CumulativeSum = Column + previous(0)
        }
      `)
    ).toMatchObject({
      type: {
        columnNames: ['Column', 'CumulativeSum'],
        columnTypes: [{ type: 'number' }, { type: 'number' }],
      },
      value: [
        [N(1), N(2), N(0), N(0), N(3), N(-3), N(-3)],
        [N(1), N(3), N(3), N(3), N(6), N(3), N(0)],
      ],
    });
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
    expect(result).toMatchObject({
      type: {
        columnNames: ['Years', 'Cost'],
        columnTypes: [
          { type: 'number' },
          { cellType: { type: 'number' }, indexedBy: 'Cars' },
        ],
        indexName: 'Fuel',
      },
      value: [
        [N(1), N(2), N(3)],
        [
          [N(100), N(200)],
          [N(200), N(400)],
          [N(300), N(600)],
        ],
      ],
    });

    const resultInvertedDims = await runCode(
      fuelTable('Cars.Num * Fuel.Years')
    );
    expect(resultInvertedDims).toMatchObject({
      type: {
        columnNames: ['Years', 'Cost'],
        columnTypes: [
          { type: 'number' },
          { cellType: { type: 'number' }, indexedBy: 'Cars' },
        ],
        indexName: 'Fuel',
      },
      value: [
        [N(1), N(2), N(3)],
        [
          [N(100), N(200)],
          [N(200), N(400)],
          [N(300), N(600)],
        ],
      ],
    });

    const resultExtraDim = await runCode(
      fuelTable('Cars.Num * Fuel.Years * [1]')
    );
    expect(resultExtraDim).toMatchObject({
      type: {
        columnNames: ['Years', 'Cost'],
        columnTypes: [
          {
            type: 'number',
          },
          {
            cellType: { cellType: { type: 'number' }, indexedBy: null },
            indexedBy: 'Cars',
          },
        ],
        indexName: 'Fuel',
      },
      value: [
        [N(1), N(2), N(3)],
        [
          [[N(100)], [N(200)]],
          [[N(200)], [N(400)]],
          [[N(300)], [N(600)]],
        ],
      ],
    });

    const resultExtraDim2 = await runCode(
      fuelTable('Cars.Num * [1] * Fuel.Years')
    );
    expect(resultExtraDim2).toMatchObject({
      type: {
        columnNames: ['Years', 'Cost'],
        columnTypes: [
          {
            type: 'number',
          },
          {
            cellType: { cellType: { type: 'number' }, indexedBy: null },
            indexedBy: 'Cars',
          },
        ],
        indexName: 'Fuel',
      },
      value: [
        [N(1), N(2), N(3)],
        [
          [[N(100)], [N(200)]],
          [[N(200)], [N(400)]],
          [[N(300)], [N(600)]],
        ],
      ],
    });
  });

  /**
   * TODO Test these examples
   * > Table2 = { A = [ 1, 2, 3 ] }
   * > Table.As = Table2.A
   * > Table
   * > Table.Bs = [1,2]
   * > Table
   * {
   *   As = [ 1, 2, 3 ],
   *   Bs = [ 1, 2 ]
   * }
   *
   * ----
   *
   * > Table = {}
   * > Table.A = 1
   * > Table
   *
   * ----
   *
   * Table = {}
   * Table.WithPrev = 1 + previous(0)
   */
  it.todo('empty table behavior');

  it('looked-up rows can be accessed', async () => {
    expect(
      await runCode(`
        Table = {
          Names = ["Hello", "World"],
          Numbers = [0, 1]
        }
        lookup(Table, Table.Names == "World").Numbers
      `)
    ).toMatchObject({
      type: {
        type: 'number',
      },
      value: N(1),
    });
  });

  it('can be empty and built-up afterwards', async () => {
    expect(
      await runCode(`
        Table = {}
        Table.Index = [1, 2, 3]
        Table.Formula = Index + 3
        sum(Table.Formula)
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(15),
      }
    `);
  });

  it('can be partially errors', async () => {
    expect(
      await runCode(`
        Table = { A = 1 meter + 1 second, B = 2 }
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": table<B = number>,
        "value": Array [
          Array [
            DeciNumber(2),
          ],
        ],
      }
    `);
    expect(
      await runCode(`
        Table = {}
        Table.Index = 1 meter + 1 second
        Table.Formula = 3
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": column<number, indexed by Table>,
        "value": Array [
          DeciNumber(3),
        ],
      }
    `);

    expect(
      await runCode(`
        Table = {}
        Table.Index = 1 meter + 1 second
        Table.Formula = 3
        Table
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": table<Formula = number>,
        "value": Array [
          Array [
            DeciNumber(3),
          ],
        ],
      }
    `);
  });
});

describe('Matrices', () => {
  const createVars = `
    Cities = categories ["Lisbon", "Faro"]
    CoffeePrice[Cities] = 0.70 EUR
  `;
  it('can assign contents', async () => {
    expect(
      await runCode(`
        ${createVars}
        CoffeePrice[Cities] = 1.20 EUR
      `)
    ).toMatchObject({
      type: {
        cellType: {
          type: 'number',
          unit: U('EUR', { known: true }),
        },
        indexedBy: 'Cities',
      },
      value: [N(12, 10), N(12, 10)],
    });
  });

  it('can assign partial contents', async () => {
    expect(
      await runCode(`
        ${createVars}
        CoffeePrice[Cities == "Faro"] = 1.20 EUR
      `)
    ).toMatchObject({
      type: {
        cellType: {
          type: 'number',
          unit: U('EUR', { known: true }),
        },
      },
      value: [N(7, 10), N(12, 10)],
    });
  });

  it('can read contents', async () => {
    expect(
      await runCode(`
        ${createVars}
        CoffeePrice[Cities == "Faro"] = 1.20 EUR
        CoffeePrice[Cities]
      `)
    ).toMatchObject({
      type: {
        cellType: {
          type: 'number',
          unit: U('EUR', { known: true }),
        },
        indexedBy: 'Cities',
      },
      value: [N(7, 10), N(12, 10)],
    });
  });

  it('can read partial contents', async () => {
    expect(
      await runCode(`
        ${createVars}
        CoffeePrice[Cities == "Faro"] = 1.2
        CoffeePrice[Cities == "Faro"]
      `)
    ).toMatchObject({
      type: {
        cellType: {
          type: 'number',
          unit: U('EUR', { known: true }),
        },
        indexedBy: 'Cities',
      },
      value: [N(12, 10)],
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
          {
            exp: N(1),
            known: true,
            multiplier: N(1),
            unit: 'meters',
          },
          {
            exp: N(-1),
            known: true,
            multiplier: N(1),
            unit: 'seconds',
          },
        ],
      },
      value: N(1),
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
      value: N(1),
      type: {
        unit: [
          {
            exp: N(1),
            known: true,
            multiplier: N(1),
            unit: 'meters',
          },
          {
            exp: N(-1),
            known: true,
            multiplier: N(1),
            unit: 'seconds',
          },
        ],
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
      value: N(6),
      type: {
        unit: [
          {
            exp: N(1),
            known: true,
            multiplier: N(1),
            unit: 'meters',
          },
        ],
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
      value: N(2),
      type: {
        unit: [
          {
            exp: N(-1),
            known: true,
            multiplier: N(1),
            unit: 'seconds',
          },
        ],
      },
    });
  });

  it('per acts as /', async () => {
    expect(await runCode('kw per hour')).toMatchObject({
      value: N(1000),
      type: t.number(
        U([u('hours', { exp: N(-1) }), u('w', { multiplier: N(1000) })])
      ),
    });
  });

  it('can avoid converting months to seconds', async () => {
    const { type, value } = await runCode(
      '(120 meter^2) * (50 USD/meter^2/month)'
    );
    expect(type).toMatchObject({
      type: 'number',
      unit: U([
        u('USD', { known: true }),
        u('months', { known: true, exp: N(-1) }),
      ]),
    });
    expect(value?.valueOf()).toEqual(6000);
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
          Days = Months == MaybeEqualMonths
        }
      `)
    ).toMatchObject({
      type: {
        columnNames: ['Months', 'MaybeEqualMonths', 'Days'],
        columnTypes: [
          {
            date: 'month',
          },
          {
            date: 'month',
          },
          {
            type: 'boolean',
          },
        ],
      },
      value: [
        [1598918400000n, 1601510400000n, 1604188800000n],
        [1598918400000n, 1604188800000n, 1601510400000n],
        [true, false, false],
      ],
    });
  });

  it('can get the max of a list of dates', async () => {
    expect(
      await runCode(`max([date(2050-Jan-01), date(2025-Jun-01)])`)
    ).toMatchObject({
      type: {
        date: 'day',
      },
      value: 2524608000000n,
    });
  });

  it('can operate between dates', async () => {
    expect(await runCode(`date(2020) - date(2010)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('year', { known: true }),
      },
      value: N(10),
    });
    expect(await runCode(`date(2020-01) - date(2010-01)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('month', { known: true }),
      },
      value: N(120),
    });
    expect(await runCode(`date(2020-01-01) - date(2010-01-01)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('day', { known: true }),
      },
      value: N(3652),
    });
    expect(
      await runCode(`date(2020-01-01T10:30) - date(2020-01-01T09:30)`)
    ).toMatchObject({
      type: {
        type: 'number',
        unit: U('minute', { known: true }),
      },
      value: N(60),
    });
    expect(
      await runCode(`date(2020-01-01T10:30:16) - date(2020-01-01T10:30:00)`)
    ).toMatchObject({
      type: {
        type: 'number',
        unit: U('second', { known: true }),
      },
      value: N(16),
    });

    expect(await runCode(`1 year + date(2020)`)).toMatchObject({
      type: {
        date: 'year',
      },
      value: 1609459200000n,
    });
    expect(await runCode(`date(2020-01) + 12 months`)).toMatchObject({
      type: {
        date: 'month',
      },
      value: 1609459200000n,
    });
    expect(await runCode(`date(2020-01) + 1 year`)).toMatchObject({
      type: {
        date: 'month',
      },
      value: 1609459200000n,
    });
    expect(await runCode(`[ date(2020-01) ] + [ 1 year ]`)).toMatchObject({
      type: {
        cellType: {
          date: 'month',
        },
      },
      value: [1609459200000n],
    });
    expect(
      await runCode(`date(2020-01-01T10:30:16) - 16 seconds`)
    ).toMatchObject({
      type: {
        date: 'second',
      },
      value: 1577874600000n,
    });
    expect(await runCode(`date(2020-01-01) - 1 week`)).toMatchObject({
      type: {
        date: 'day',
      },
      value: BigInt(new Date('2019-12-25').getTime()),
    });
  });
});

describe('Injected external data', () => {
  it('can be injected into the language', async () => {
    expect(
      await runAST(block(n('externalref', 'random-id')), {
        externalData: {
          'random-id': {
            type: serializeType(t.column(t.string())),
            value: ['Hello', 'World'],
          },
        },
      })
    ).toMatchObject({
      value: ['Hello', 'World'],
      type: t.column(t.string()),
    });
  });
});

describe('number units work together', () => {
  it('handles no units', async () => {
    expect(await runCode(`1 + 2`)).toMatchObject({
      value: N(3),
      type: t.number(),
    });
  });

  it('handles unknown units', async () => {
    expect(await runCode(`1 banana + 2 bananas`)).toMatchObject({
      value: N(3),
      type: t.number([
        {
          unit: 'bananas',
          exp: N(1),
          multiplier: N(1),
          known: false,
        },
      ]),
    });
  });

  it('handles known units', async () => {
    expect(await runCode(`1 meter + 2 meters`)).toMatchObject({
      value: N(3),
      type: t.number([
        {
          unit: 'meters',
          exp: N(1),
          multiplier: N(1),
          known: true,
        },
      ]),
    });
  });

  it('handles known units with multipliers (1)', async () => {
    expect(
      await runCode(`
        10 centimeters
      `)
    ).toMatchObject({
      value: N(10, 100),
      type: t.number(U('meters', { multiplier: N(1, 100) })),
    });
  });

  it('handles known units without multipliers (2)', async () => {
    expect(
      await runCode(`
        2 meters + 4 meters
      `)
    ).toMatchObject({
      value: N(6),
      type: t.number(U('meters')),
    });
  });

  it('handles known units with multipliers (3)', async () => {
    expect(
      await runCode(`
        10 centimeters + 2 centimeters
      `)
    ).toMatchObject({
      value: N(12, 100),
      type: t.number([
        {
          unit: 'meters',
          exp: N(1),
          multiplier: N(0.01),
          known: true,
        },
      ]),
    });
  });

  it('handles known units with multipliers (4)', async () => {
    expect(
      await runCode(`
        10 centimeters + 2 meters
      `)
    ).toMatchObject({
      value: N(21, 10),
      type: t.number(U('meters')),
    });
  });

  it('handles exponentiated known units with multipliers', async () => {
    expect(await runCode(`1 centimeters^2 + 2 meters^2`)).toMatchObject({
      value: N(20001, 10000),
      type: t.number([
        {
          unit: 'meters',
          exp: N(2),
          multiplier: N(1),
          known: true,
        },
      ]),
    });
  });

  it('multiplies units', async () => {
    expect(await runCode(`10 kilometers * 3 hours`)).toMatchObject({
      value: N(30000, 1),
      type: t.number(U([u('meters', { multiplier: N(1000) }), u('hours')])),
    });
  });

  it('can use divided units', async () => {
    expect(await runCode(`3 kilometers/minute`)).toMatchObject({
      value: N(3000),
      type: t.number(
        U([u('meters', { multiplier: N(1000) }), u('minutes', { exp: N(-1) })])
      ),
    });
  });

  it('divides two simple units', async () => {
    expect(await runCode('3 kilometers / (1 minute)')).toMatchObject({
      value: N(3000, 1),
      type: t.number(
        U([u('meters', { multiplier: N(1000) }), u('minutes', { exp: N(-1) })])
      ),
    });
  });

  it('cancels out units', async () => {
    expect(await runCode(`4 miles/hour * 2 hour`)).toMatchObject({
      value: N(8),
      type: t.number([
        {
          unit: 'miles',
          exp: N(1),
          multiplier: N(1),
          known: true,
        },
      ]),
    });
  });

  it('does the right thing when exponentiating with units', async () => {
    expect(await runCode(`2 ** (4 as years)`)).toMatchObject({
      value: N(16),
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
      value: N(1),
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
      type: t.column(t.date('year')),
    });
  });

  it('calculates number from time quantity', async () => {
    expect(await runCode(`(date(2021) - date(2020)) as years`)).toMatchObject({
      value: N(1),
      type: number(U('years')),
    });
  });

  it('(historical dates regression): can subtract dates', async () => {
    expect(await runCode(`date(1883-12) - date(1883-10)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('month', { known: true }),
      },
      value: N(2),
    });
    expect(await runCode(`date(1884-01) - date(1883-01)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('month', { known: true }),
      },
      value: N(12),
    });
    expect(await runCode(`date(1900) - date(1883)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('year', { known: true }),
      },
      value: N(17),
    });
    expect(await runCode(`date(2200) - date(1883)`)).toMatchObject({
      type: {
        type: 'number',
        unit: U('year', { known: true }),
      },
      value: N(317),
    });
  });

  it('calculates number from time quantity decade', async () => {
    expect(await runCode(`(date(2040) - date(2030)) as decade`)).toMatchObject({
      value: N(1),
      type: number(U('decade')),
    });
  });

  it('calculates number from time quantity century', async () => {
    expect(await runCode(`(date(2130) - date(2030)) as century`)).toMatchObject(
      {
        value: N(1),
        type: number(U('century')),
      }
    );
  });

  it('calculates number from time quantity millennia', async () => {
    expect(
      await runCode(`(date(4000) - date(1000)) as millennia`)
    ).toMatchObject({
      value: N(3),
      type: number(U('millennia')),
    });
  });

  it('calculates number from time quantity millenniums', async () => {
    expect(
      await runCode(`(date(8000) - date(1000)) as millenniums`)
    ).toMatchObject({
      value: N(7),
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
          N(1),
          N(27, 25),
          N(729, 625),
          N(19683, 15625),
          N(531441, 390625),
          N(14348907, 9765625),
        ],
        [N(4), N(108, 25), N(467, 100), N(126, 25), N(136, 25), N(147, 25)],
      ],
    });
  });

  it('handles non-scalar unit conversions', async () => {
    expect(await runCode(`1Kelvin + 2°C + 3°F`)).toMatchObject({
      // 1 + (2 + 273.15) + ((3 - 32) * 5 / 9 + 273.15)
      // = 1 + 275.15 + 257.03(8) =  533.18(8)
      value: N(50007, 100),
      type: t.number(U('°F')),
    });
  });

  it('handles negative exp unit multipliers when converting', async () => {
    expect(await runCode(`2 liter/km * 3 km`)).toMatchObject({
      value: N(6),
      type: t.number(U('liters')),
    });
  });

  it('converts between complex units', async () => {
    expect(
      await runCode(`100 joules/kilometer to calories/foot`)
    ).toMatchObject({
      value: N(381, 52300),
      type: t.number(U([u('calories'), u('feet', { exp: N(-1) })])),
    });
  });

  it('converts between mixed known and unknown units', async () => {
    expect(await runCode(`1 bananas/second as bananas/minute`)).toMatchObject({
      value: N(60),
      type: t.number(
        U([u('bananas', { known: false }), u('minutes', { exp: N(-1) })])
      ),
    });
  });

  it('converts between exponentiated and non-exponentiated but expandable to same', async () => {
    expect(await runCode('100 centimeter^3 in cubicmetre'))
      .toMatchInlineSnapshot(`
      Object {
        "type": cubicmetre,
        "value": DeciNumber(0.0001),
      }
    `);
  });

  it('autoconverts complex units', async () => {
    expect(
      await runCode(`1 joule/meter^2 + 2 calories/inch^2 as kg/second^2`)
    ).toMatchObject({
      value: N(209216129000, 16129),
      type: t.number(
        U([u('g', { multiplier: N(1000) }), u('seconds', { exp: N(-2) })])
      ),
    });
  });

  it('expands expandable units (1)', async () => {
    expect(await runCode(`1 squaremeter + 2 meter^2`)).toMatchObject({
      value: N(3),
      type: t.number(U('meters', { exp: N(2) })),
    });
  });

  it('autoconverts expanding expandable units (2)', async () => {
    expect(await runCode(`1 newton/meter^2 + 2 bar`)).toMatchObject({
      value: N(200001, 100000),
      type: t.number(U('bars')),
    });
  });

  it('autoconverts expanding expandable units (3)', async () => {
    expect(await runCode(`2 bar + 1 newton/meter^2`)).toMatchObject({
      value: N(200001),
      type: t.number(U([u('meters', { exp: N(-2) }), u('newtons')])),
    });
  });

  it('autoconverts expanding expandable units (4)', async () => {
    expect(await runCode(`2 bar + 1 newton/inch^2 as Pa`)).toMatchObject({
      value: N(3250800000, 16129),
      type: t.number(U('Pa')),
    });
  });

  it('volume expanding units', async () => {
    expect(await runCode(`(1 ft * 1 ft * 1 ft) as ft3`)).toMatchObject({
      value: N(1),
      type: t.number(U('ft3')),
    });
    expect(await runCode(`(1 inch * 1 inch * 1 inch) as in3`)).toMatchObject({
      value: N(1),
      type: t.number(U('in3')),
    });
    expect(await runCode(`(1 yd * 1 yd * 1 yd) as yd3`)).toMatchObject({
      value: N(1),
      type: t.number(U('yd3')),
    });
    expect(await runCode(`(1 mi * 1 mi * 1 mi) as cumi`)).toMatchObject({
      value: N(1),
      type: t.number(U('cumi')),
    });
  });

  it('converts to contracted unit (1)', async () => {
    expect(await runCode(`1 newtons/meter^2 in bars`)).toMatchObject({
      value: N(1, 100000),
      type: t.number(U('bars')),
    });
  });

  it('should convert joules into kw hour', async () => {
    const run = await runCode(`3600 kj in kw h`);

    expect(run).toMatchObject({
      value: N(1000),
      type: t.number(U([u('w', { multiplier: N(1000) }), u('h')])),
    });
  });

  it('should convert 1cm into mm', async () => {
    const run = await runCode(`1 cmeter in mmeter`);

    expect(run).toMatchObject({
      value: N(1, 100),
      type: t.number(U([u('meter', { multiplier: N(0.001) })])),
    });
  });

  it('should convert 1 decimetre into centimetre', async () => {
    const run = await runCode(`1 decimetre in centimetre`);

    expect(run).toMatchObject({
      value: N(1, 10),
      type: t.number(U([u('metre', { multiplier: N(0.01) })])),
    });
  });

  it('should convert 1 cm into millimetre', async () => {
    const run = await runCode(`1 cmeter in millimetre`);

    expect(run).toMatchObject({
      value: N(1, 100),
      type: t.number(U([u('metre', { multiplier: N(1, 1000) })])),
    });
  });

  it('should convert 1mm into nm', async () => {
    const run = await runCode(`1 mmeter in nmeter`);

    expect(run).toMatchObject({
      value: N(1, 1000),
      type: t.number(U([u('meter', { multiplier: N(1, 1_000_000_000) })])),
    });
  });

  it('should convert 1mm into μm', async () => {
    const run = await runCode(`1 mmeter in μmeter`);

    expect(run).toMatchObject({
      value: N(1, 1000),
      type: t.number(U([u('meter', { multiplier: N(0.000001) })])),
    });
  });

  it('should calculate 1cF + 1cF', async () => {
    const run = await runCode(`1 cF + 1 cF`);

    expect(run).toMatchObject({
      value: N(2, 100),
      type: t.number(U([u('F', { multiplier: N(1, 100) })])),
    });
  });

  it('should calculate 1 centifarad + 1 centifarad', async () => {
    const run = await runCode(`1 centifarad + 1 centifarad`);

    expect(run).toMatchObject({
      value: N(2, 100),
      type: t.number(U([u('farads', { multiplier: N(1, 100) })])),
    });
  });

  it('converts to contracted unit (2)', async () => {
    expect(await runCode(`10 kg*meter/sec^2 in newtons`)).toMatchObject({
      value: N(10),
      type: t.number(U('newtons')),
    });
  });

  it('divides and cancels unknown units', async () => {
    expect(await runCode(`1 banana / ( 3 bananas )`)).toMatchObject({
      value: N(1, 3),
      type: t.number(),
    });
  });

  it('divides and cancels known units', async () => {
    expect(await runCode(`1 hour / ( 3 hours )`)).toMatchObject({
      value: N(1, 3),
      type: t.number(),
    });
  });

  it('divides and cancels time units', async () => {
    expect(await runCode(`1 hour / ( 3 minutes )`)).toMatchObject({
      value: N(20),
      type: t.number(),
    });
  });

  it('autoconverts time units correctly', async () => {
    expect(await runCode(`1 hour / ( 3 minutes^2 )`)).toMatchObject({
      value: N(20),
      type: t.number(U('minutes', { exp: N(-1) })),
    });
  });

  it('multiplies units correctly (1)', async () => {
    expect(
      await runCode(`
        30 watts * 50 hours/month
      `)
    ).toMatchObject({
      value: N(1500),
      type: t.number(U([u('hours'), u('months', { exp: N(-1) }), u('watts')])),
    });
  });

  it('multiplies units correctly (2)', async () => {
    expect(
      await runCode(`
        2 usd/watt * 3 watt
      `)
    ).toMatchObject({
      value: N(6),
      type: t.number(U([u('usd')])),
    });
  });

  it('multiplies units correctly (3.1)', async () => {
    expect(
      await runCode(`
        2 usd/watt/hour * 3 watt
      `)
    ).toMatchObject({
      value: N(6),
      type: t.number(U([u('hours', { exp: N(-1) }), u('usd')])),
    });
  });

  it('multiplies units correctly (3.2)', async () => {
    expect(
      await runCode(`
      3 watt * 2 usd/watt/hour
      `)
    ).toMatchObject({
      value: N(6),
      type: t.number(U([u('hours', { exp: N(-1) }), u('usd')])),
    });
  });

  it('multiplies units correctly (4)', async () => {
    expect(
      await runCode(`
        1500 watt*hours/month * 1 usd/watt/hour
      `)
    ).toMatchObject({
      value: N(1500),
      type: t.number(U([u('months', { exp: N(-1) }), u('usd')])),
    });
  });

  it('multiplies units correctly (5)', async () => {
    expect(
      await runCode(`
        round(30 gallons * 1.4 * 100 USD/gallon, 2)
      `)
    ).toMatchObject({
      value: N(4200),
      type: t.number(U('USD')),
    });
  });

  it('autoconverts units', async () => {
    expect(await runCode(`30 psi + 1 newton/inch^2`)).toMatchObject({
      value: N(197582111, 1469600),
      type: t.number(U([u('inches', { exp: N(-2) }), u('newtons')])),
    });

    expect(await runCode(`30 bar + 100000 N/meter^2`)).toMatchObject({
      value: N(3100000),
      type: t.number(U([u('N'), u('meters', { exp: N(-2) })])),
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
        [N(0), N(1)], // YearSeq
        [N(1), N(27, 25)], // InterestRate
        [N(4), N(432, 100)], // Price
      ],
      type: t.table({
        indexName: 'Fuel',
        columnTypes: [
          t.number(),
          t.number(),
          t.number(U([u('USD'), u('gallons', { exp: N(-1) })])),
        ],
        columnNames: ['Seq', 'InterestRate', 'Price'],
      }),
    });
  });

  it("nonscalar unit conversions don't get in the way", async () => {
    expect(await runCode(`44 zettabytes/year`)).toMatchObject({
      value: N(44000000000000000000000),
      type: t.number(
        U([u('bytes', { multiplier: N(1e21) }), u('years', { exp: N(-1) })])
      ),
    });
  });
});

describe('unit conversion', () => {
  it('does not loose precision when chained', async () => {
    expect(
      await runCode('27.33 miles/hour in kilometer/second in mph')
    ).toMatchObject({
      value: N(2733, 100),
      type: t.number(U('mph')),
    });
  });

  it('can be applied to columns', async () => {
    expect(
      await runCode(`
        [1, 2, 3] as watts
      `)
    ).toMatchObject({
      value: [N(1), N(2), N(3)],
      type: t.column(t.number(U('watts'))),
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
        N(307671875, 183264048),
        N(2461375, 2950464),
        N(12306875, 5900928),
      ],
      type: t.column(t.number(U('hours')), 'Animals'),
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
    ).toMatchObject({
      type: {
        cellType: {
          cellType: {
            type: 'number',
            unit: U('hours', { known: true }),
          },
          indexedBy: 'Animals',
        },
      },
      value: [
        [N(168, 100), N(83, 100)],
        [N(168, 100), N(83, 100)],
        [N(168, 100), N(83, 100)],
      ],
    });
  });

  it('converts autoexpanding units correctly', async () => {
    expect(await runCode(`1000 milliliters in liters`)).toMatchObject({
      value: N(1),
      type: t.number(U('liters')),
    });
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
      value: N(20),
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
      value: N(10),
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
      value: N(200),
      type: t.number(U('g')),
    });
  });

  it('can derive custom units', async () => {
    expect(
      await runCode(`
      Sugar = 1 cup
      Glass = 0.33 L
      Sugar in Glass`)
    ).toMatchObject({
      value: N(25, 33),
      type: t.number(U('Glass', { known: false })),
    });
  });
});

describe('math operators', () => {
  it('rounds number', async () => {
    expect(await runCode(`round(1.7 grams)`)).toMatchObject({
      value: N(2),
      type: t.number(U('grams')),
    });
  });
  it('sqrt works on units', async () => {
    expect(await runCode(`sqrt(1 banana)`)).toMatchObject({
      value: N(1),
      type: t.number(U('bananas', { known: false, exp: N(1, 2) })),
    });
  });
  it('sqrt works on non-rational results by approximation', async () => {
    expect(await runCode(`sqrt(60 m / (9.8m) / s^2)`)).toMatchObject({
      value: N(9032400, 3650401),
      type: t.number(U('s', { exp: N(-1) })),
    });
  });
});

describe('len', () => {
  it('len a column', async () => {
    expect(await runCode('len([1])')).toMatchObject({
      type: {
        type: 'number',
      },
      value: N(1),
    });
    expect(await runCode('len(["contents"])')).toMatchObject({
      type: {
        type: 'number',
      },
      value: N(1),
    });
  });
});

describe('type coercion', () => {
  it('can type coerce column cells to the same unit', async () => {
    expect(await runCode(`[1 centigram, 2]`)).toMatchObject({
      value: [N(1, 100), N(2, 100)],
      type: t.column(t.number(U('grams', { multiplier: N(1, 100) }))),
    });
  });

  it('can coerce imprecise numbers', async () => {
    expect(await runCode('(30 days in month) + 1')).toMatchInlineSnapshot(`
      Object {
        "type": ~month,
        "value": DeciNumber(2),
      }
    `);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can coerce the arguments of an autoconverted function', async () => {
    expect(await runCode(`1 centigram + 2`)).toMatchObject({
      value: N(3, 100),
      type: t.number(U('grams', { multiplier: N(1, 100) })),
    });
  });
});

describe('unit qualities', () => {
  it('cannot be applied to numbers without units', async () => {
    expect(await runCode('3 of sugar')).toMatchObject({
      type: {
        errorCause: InferError.needOneAndOnlyOneUnit(),
      },
      value: N(3),
    });
  });

  it('applies to numbers with single unit', async () => {
    expect(await runCode('3 grams of sugar')).toMatchObject({
      value: N(3),
      type: t.number(U('grams', { quality: 'sugar' })),
    });
  });

  it('applies to numbers with single unit with exponent', async () => {
    expect(await runCode('600 meter^2 of land')).toMatchObject({
      value: N(600),
      type: t.number(U('meters', { exp: N(2), quality: 'land' })),
    });
  });

  it('applies to multi-dimensional values', async () => {
    expect(await runCode('[1, 2, 3] grams of sugar')).toMatchObject({
      value: [N(1), N(2), N(3)],
      type: t.column(t.number(U('grams', { quality: 'sugar' }))),
    });
  });

  it('propagates through addition', async () => {
    expect(await runCode('3 grams of sugar + 1')).toMatchObject({
      value: N(4),
      type: t.number(U('grams', { quality: 'sugar' })),
    });
  });

  it('propagates when divided by unitless number', async () => {
    expect(await runCode('3 grams of sugar / 2')).toMatchObject({
      value: N(3, 2),
      type: t.number(U('grams', { quality: 'sugar' })),
    });
  });

  it('propagates when divided by number with quality', async () => {
    expect(await runCode('3 grams / kilogram of bodymass')).toMatchObject({
      value: N(3, 1000),
      type: t.number(
        U([
          u('grams', { quality: 'bodymass', exp: N(-1), multiplier: N(1000) }),
          u('grams'),
        ])
      ),
    });
  });
});

describe('percentages', () => {
  it('can be added and subtracted from numbers', async () => {
    expect(await runCode('3%')).toMatchObject({
      value: N(3, 100),
      type: t.number(null, 'percentage'),
    });
    expect(await runCode('3% + 2')).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(2.03),
      }
    `);
    expect(await runCode('2 + 3%')).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(2.06),
      }
    `);
    expect(await runCode('3% + 1%')).toMatchInlineSnapshot(`
      Object {
        "type": percentage,
        "value": DeciNumber(0.04),
      }
    `);

    expect(await runCode('100 - 10%')).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(90),
      }
    `);
  });

  it('multiplies properly', async () => {
    expect(await runCode('3% * 2')).toMatchObject({
      value: N(6, 100),
      type: t.number(),
    });
    expect(await runCode('2 * 3%')).toMatchObject({
      value: N(6, 100),
      type: t.number(),
    });
    expect(await runCode('3% * 3%')).toMatchObject({
      value: N(9, 10000),
      type: t.number(null, 'percentage'),
    });
  });

  it('divides properly', async () => {
    expect(await runCode('3% / 2')).toMatchObject({
      value: N(15, 1000),
      type: t.number(),
    });
    expect(await runCode('2 / 50%')).toMatchObject({
      value: N(4),
      type: t.number(),
    });
    expect(await runCode('100% / 10%')).toMatchObject({
      value: N(10),
      type: t.number(null, 'percentage'),
    });
  });

  it('propagates units correctly', async () => {
    expect(await runCode('3% / 2 meters')).toMatchObject({
      value: N(15, 1000),
      type: t.number(U('meters')),
    });
    expect(await runCode('8 meters * 50%')).toMatchObject({
      value: N(4),
      type: t.number(U('meters')),
    });
    expect(await runCode('100% + 2 meter')).toMatchObject({
      value: N(3),
      type: t.number(U('meters')),
    });
    expect(await runCode('100% + 50%')).toMatchObject({
      value: N(3, 2),
      type: t.number(null, 'percentage'),
    });
  });

  it('can be converted from a number', async () => {
    expect(await runCode('0.1 in %')).toMatchInlineSnapshot(`
      Object {
        "type": percentage,
        "value": DeciNumber(0.1),
      }
    `);
  });
});

describe('tiered function', () => {
  it('works with no units', async () => {
    const tiered = `
    BaseValue = 4
    T(x) = tiered x {
      2: tier * BaseValue * 2
      4: tier * BaseValue * 1
      6: tier * BaseValue * 20
    }
    T(5)`;
    expect(await runCode(tiered)).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(104),
      }
    `);
  });

  it('works with units', async () => {
    const tiered = `
    BaseValue = 4 EUR / interview * month
    T(x) = tiered x {
      2 interviews/month: tier * BaseValue * 2
      4 interviews/month: tier * BaseValue * 1
      6 interviews/month: tier * BaseValue * 20
    }
    T(5 interviews/month)`;
    expect(await runCode(tiered)).toMatchInlineSnapshot(`
      Object {
        "type": EUR,
        "value": DeciNumber(104),
      }
    `);
  });

  it('works with unit conversions', async () => {
    const tiered = `
    BaseValue = 4 EUR / interview * month
    T(x) = tiered x {
      2 interviews/month: tier * BaseValue * 2
      4 interviews/month: tier * BaseValue * 1
      6 interviews/month: tier * BaseValue * 20
    }
    T(60 interviews/year)`;
    expect(await runCode(tiered)).toMatchInlineSnapshot(`
      Object {
        "type": EUR,
        "value": DeciNumber(104),
      }
    `);
  });

  it('infers and converts incomplete units correctly', async () => {
    const tiered = `
    Hewwo = tiered 10 {
      1 : $10,
      2 : 2
    }`;
    expect(await runCode(tiered)).toMatchInlineSnapshot(`
      Object {
        "type": $,
        "value": DeciNumber(12),
      }
    `);
  });
});

describe('grammar extensions', () => {
  it('for is an alias for *', async () => {
    const tiered = `
    Cost = $100 per month
    Yearly = Cost for 1 year
    `;
    expect(await runCode(tiered)).toMatchInlineSnapshot(`
      Object {
        "type": $,
        "value": DeciNumber(1200),
      }
    `);
  });
});
