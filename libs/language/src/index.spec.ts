// E2e tests

import { Type } from './type';
import {
  runCode,
  runCodeForVariables,
  objectToTupleType,
  objectToTupleValue,
} from './testUtils';

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
      value: [[2, -1, 1, 1.01, 0.25, 16, 4]],
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
      value: [[true, false, true, false, true]],
    });
  });

  it('has correct operator precedence', async () => {
    expect(await runCode('1 + 2 / 4 - 5 ** 2 / 4')).toMatchObject({
      type: { type: 'number' },
      value: [-4.75],
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
      function functionname(a b) => a + b

      functionname(1, 2)
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
      function multiply(A B) => A * B
      multiply([ 1, 2, 3 ], 2)
    `);

    expect(results).toMatchObject({
      type: { columnSize: 3, cellType: { type: 'number' } },
      value: [[2, 4, 6]],
    });
  });

  it('Can run a function with two columns as arguments', async () => {
    const results = await runCode(`
      function multiply(A B) => A * B
      multiply([ 1, 2, 3 ], [ 1, 2, 0 ])
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
          Column2 = Column1 + previous(0)
        }
      `)
    ).toEqual({
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

  it('Can be referred to by column', async () => {
    expect(
      await runCode(`
        Table = {
          Col = [1, 2, 3]
        }

        Table.Col
      `)
    ).toMatchObject({
      type: Type.build({ type: 'number', columnSize: 3 }),
      value: [[1, 2, 3]],
    });
  });

  it('Supports simple tuples with one item', async () => {
    expect(
      await runCodeForVariables(
        `
        Table = {
          Item1 = 1,
          Item2 = 2
        }

        PropAccess = Table.Item2
      `,
        ['Table', 'PropAccess']
      )
    ).toMatchObject({
      variables: {
        Table: [1, 2],
        PropAccess: 2,
      },
      types: {
        Table: Type.buildTuple([Type.Number, Type.Number], ['Item1', 'Item2']),
        PropAccess: Type.Number,
      },
    });
  });

  it('Are expressions', async () => {
    const col1Type = Type.buildColumn(Type.Number, 3);
    expect(
      await runCode(`
        [{ Col1 = [1, 2, 3] }]
      `)
    ).toMatchObject({
      type: Type.buildColumn(Type.buildTuple([col1Type], ['Col1']), 1),
      value: [[[[1, 2, 3]]]],
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
        Containment = contains(Range, 3)
      `)
    ).toMatchObject({
      type: { type: 'boolean' },
      value: [true],
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
      value: [Array(2).fill(Date.UTC(2020, 9, 10, 10, 30))],
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

describe('Time quantities', () => {
  it('evaluates time quantities', async () => {
    expect(
      await runCodeForVariables(
        `
        Years = [ 7 years ]
        Quarters = [ 3 quarters ]
        Seconds = [ 999 seconds ]
        Combined = [ 4 quarters and 3 second and 1 millisecond ]
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
        Years: Type.buildTimeQuantity(['year']),
        Quarters: Type.buildTimeQuantity(['quarter']),
        Seconds: Type.buildTimeQuantity(['second']),
        Combined: Type.buildTimeQuantity(['quarter', 'second', 'millisecond']),
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
      value: [[2, 3, 4]],
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
      value: [[0, 0, 0]],
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
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
      ],
      type: {
        tupleNames: ['Ayy', 'Bee'],
        tupleTypes: [{ columnSize: 3 }, { columnSize: 3 }],
      },
    });

    expect(
      await runCode(`
        SidewaysTbl = [
          {Ayy = 1, Bee = 0},
          {Ayy = 1, Bee = 1},
          {Ayy = 1, Bee = 2}
        ]

        given SidewaysTbl: SidewaysTbl.Ayy + SidewaysTbl.Bee
      `)
    ).toMatchObject({
      value: [[1, 2, 3]],
      type: {
        columnSize: 3,
        cellType: { type: 'number' },
      },
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
