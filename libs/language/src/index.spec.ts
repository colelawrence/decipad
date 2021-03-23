// E2e tests

import * as AutoChange from 'automerge';
import { Computer } from './runtime/computer';
import { Type, TableType } from './type'

const runCode = async (source: string) => {
  const lineCount = source.split('\n').length;
  const syncDoc = AutoChange.from({
    children: [
      {
        children: [
          {
            id: 'block-id',
            type: 'code_block',
            children: [{ text: source }],
          },
        ],
      },
    ],
  });
  const computer = new Computer();
  computer.setContext(syncDoc);
  const parseResult = computer.parse();

  if (!parseResult.ok) return parseResult;

  return await computer.resultAt('block-id', lineCount);
};

describe('basic code', () => {
  it('runs basic operations', async () => {
    expect(await runCode('1 + 1')).toMatchObject({
      type: { possibleTypes: ['number'] },
      value: [2],
    });

    expect(await runCode('-1')).toMatchObject({
      type: { possibleTypes: ['number'] },
      value: [-1],
    });

    expect(await runCode('1 / 4')).toMatchObject({
      type: { possibleTypes: ['number'] },
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
      type: { possibleTypes: ['number'] },
      value: [2],
    });
  });

  it('supports functions', async () => {
    const results = await runCode(`
      functionname = a b => a + b

      functionname 1 2
    `);

    expect(results).toMatchObject({
      type: { possibleTypes: ['number'] },
      value: [3],
    });
  });

  it('Can perform operations on columns', async () => {
    const results = await runCode(`
      Column = [ 0, 1, 2, 4 ]

      Column * [ 2, 2, 2, 3 ]
    `);

    expect(results).toMatchObject({
      type: { possibleTypes: ['number'] },
      value: [[0, 2, 4, 12]],
    });
  });

  it('Can perform binops between columns and single numbers', async () => {
    const results = await runCode(`
      Column = [ 1, 2, 3 ]
      Column * 2
    `);

    expect(results).toMatchObject({
      type: { possibleTypes: ['number'], columnSize: 3 },
      value: [[2, 4, 6]],
    });

    const results2 = await runCode(`
      Column = [ 1, 2, 4 ]
      2 / Column
    `);

    expect(results2).toMatchObject({
      type: { possibleTypes: ['number'], columnSize: 3 },
      value: [[2, 1, 0.5]],
    });
  });

  it.todo('TODO: Does not allow empty columns');

  it('supports conditions', async () => {
    expect(
      await runCode(`
        A = if 1 < 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { possibleTypes: ['number'] },
      value: [1],
    });

    expect(
      await runCode(`
        A = if 1 > 3 then 1 else 0
      `)
    ).toMatchObject({
      type: { possibleTypes: ['number'] },
      value: [0],
    });
  });
});

describe('Tables', () => {
  it('can be created', async () => {
    expect(
      await runCode(`Table = { Column1 = [1, 2, 3], Column2 = Column1 * 2 }`)
    ).toMatchObject({
      type: new TableType(new Map([
        ['Column1', Type.Number.isColumn(3)],
        ['Column2', Type.Number.isColumn(3)],
      ])),
      value: new Map([
        ['Column1', [1, 2, 3]],
        ['Column2', [2, 4, 6]]
      ])
    })
  })

  it('can refer to the previous thing', async () => {
    expect(
      await runCode(`Table = { Column1 = [1, 1, 1], Column2 = Column1 + (previous 0) }`)
    ).toMatchObject({
      type: new TableType(new Map([
        ['Column1', Type.Number.isColumn(3)],
        ['Column2', Type.Number.isColumn(3)]
      ])),
      value: new Map([
        ['Column1', [1, 1, 1]],
        ['Column2', [1, 2, 3]]
      ])
    })
  })
})

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

  it.skip('units can be divided', async () => {
    expect(
      await runCode(`
        Distance = 3 meter
        Time = 3 second

        Distance / Time
      `)
    ).toMatchObject({
      value: [1],
      units: [
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

describe('Inference errors', () => {
  it.todo('TODO: Complains about missing variables');
  it.todo('TODO: Complains about mismatched units');
  it.todo('TODO: complains about mismatched types');

  it.todo('TODO: Complains about mismatched array units');
  it.todo('TODO: Complains about mismatched array lengths');
});
