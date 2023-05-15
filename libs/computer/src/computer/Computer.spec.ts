import { N } from '@decipad/number';
import {
  astNode,
  buildType as t,
  parseBlockOrThrow,
  Result,
  serializeType,
} from '@decipad/language';
import { AnyMapping, timeout } from '@decipad/utils';
import { filter, firstValueFrom } from 'rxjs';
import { all } from '@decipad/generator-utils';
import { clone } from 'lodash';
import { getExprRef } from '../exprRefs';
import {
  getIdentifiedBlock,
  getIdentifiedBlocks,
  simplifyComputeResponse,
  testProgram as makeTestProgram,
} from '../testUtils';
import { ComputeRequestWithExternalData } from '../types';
import { Computer } from './Computer';
import { ColumnDesc } from './types';
import { getResultGenerator } from '../utils';

const testProgram = getIdentifiedBlocks(
  'A = 0',
  'B1 = A + 1',
  'C = B1 + 10',
  'D = C + 100'
);
let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

const computeOnTestComputer = async (
  req: ComputeRequestWithExternalData
): Promise<string[]> => {
  const res = await computer.computeRequest(req);
  return simplifyComputeResponse(res);
};

it('computes a thing', async () => {
  const res = await computeOnTestComputer({ program: testProgram });

  expect(res).toMatchInlineSnapshot(`
    Array [
      "block-0 -> 0",
      "block-1 -> 1",
      "block-2 -> 11",
      "block-3 -> 111",
    ]
  `);
});

it('retrieves syntax errors', async () => {
  expect(
    await computeOnTestComputer({
      program: getIdentifiedBlocks('Syntax //-// Error'),
    })
  ).toEqual(['block-0 -> Syntax Error']);
});

describe('caching', () => {
  it('honours cache', async () => {
    // Fill in cache
    await computeOnTestComputer({ program: testProgram });

    // Change C
    const changedC = clone(testProgram);
    changedC[2] = getIdentifiedBlock('C = B1 + 10.1', 2);
    expect(await computeOnTestComputer({ program: changedC }))
      .toMatchInlineSnapshot(`
        Array [
          "block-0 -> 0",
          "block-1 -> 1",
          "block-2 -> 11.1",
          "block-3 -> 111.1",
        ]
      `);

    computer.reset();

    // Break it by removing B
    const broken = clone(testProgram);
    broken[0] = getIdentifiedBlock('A = 0.5', 0);
    broken.splice(1, 1);
    expect(await computeOnTestComputer({ program: broken }))
      .toMatchInlineSnapshot(`
        Array [
          "block-0 -> 0.5",
          "block-2 -> 11",
          "block-3 -> 111",
        ]
      `);

    const noD = clone(testProgram);
    noD[3] = getIdentifiedBlock('', 3);
    expect(await computeOnTestComputer({ program: noD }))
      .toMatchInlineSnapshot(`
        Array [
          "block-0 -> 0",
          "block-1 -> 1",
          "block-2 -> 11",
          "block-3 -> undefined",
        ]
      `);
  });

  it('tricky caching problems', async () => {
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('= 1', 'A + 1'),
      })
    ).toContain('block-1 -> 2');

    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('A = 1', 'A + 1'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 1",
        "block-1 -> 2",
      ]
    `);
  });

  it('tricky caching problems (2)', async () => {
    // Use a missing variable B
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('A = 1', '', 'A + 1 + C'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 1",
        "block-1 -> undefined",
        "block-2 -> 3",
      ]
    `);

    // Define it out of order
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('A = 1', '', 'A + 1 + C', 'C = 1'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 1",
        "block-1 -> undefined",
        "block-3 -> 1",
        "block-2 -> 3",
      ]
    `);
  });

  it('tricky caching problems (3)', async () => {
    // Use a missing variable B
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks(
          'Table = {}',
          'Table.A = [1]',
          'Table.B = A + C',
          'C = 1'
        ),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> [[1], [2]]",
        "block-1 -> [1]",
        "block-3 -> 1",
        "block-2 -> [2]",
      ]
    `);

    // Define it out of order
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks(
          'Table = {}',
          'Table.A = [1]',
          'Table.B = A + C',
          'C = 2'
        ),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> [[1], [3]]",
        "block-1 -> [1]",
        "block-3 -> 2",
        "block-2 -> [3]",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks(
          'Table = {}',
          'Table.A = [1]',
          'Table.B = A + C + 1',
          'C = 2'
        ),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> [[1], [4]]",
        "block-1 -> [1]",
        "block-3 -> 2",
        "block-2 -> [4]",
      ]
    `);
  });
});

describe('expr refs', () => {
  it('supports expr refs', async () => {
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks(getExprRef('block-1'), '1 + 1'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-1 -> 2",
        "block-0 -> 2",
      ]
    `);
  });

  it('supports exprRefs for table columns', async () => {
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks(
          'Table = {}',
          'Table.A = [1]',
          'C = exprRef_block_1'
        ),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> [[1]]",
        "block-1 -> [1]",
        "block-2 -> [1]",
      ]
    `);
  });
});

it('creates new, unused identifiers', async () => {
  expect(computer.getAvailableIdentifier('Name', 1)).toMatchInlineSnapshot(
    `"Name1"`
  );

  await computeOnTestComputer({
    program: getIdentifiedBlocks('AlreadyUsed1 = 1'),
  });

  expect(
    computer.getAvailableIdentifier('AlreadyUsed', 1)
  ).toMatchInlineSnapshot(`"AlreadyUsed2"`);
});

describe('uses previous value', () => {
  it('works the first and second time', async () => {
    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('A = 3', 'previous'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 3",
        "block-1 -> 3",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('A = 4'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 4",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getIdentifiedBlocks('A = 5', 'previous'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 5",
        "block-1 -> 5",
      ]
    `);
  });
});

it('can reset itself', async () => {
  // Make the cache dirty
  computer.pushCompute({ program: testProgram });
  await timeout(0); // give time to compute
  expect(computer.results.getValue().blockResults).not.toEqual({});

  computer.reset();
  expect(computer.results.getValue().blockResults).toEqual({});
});

it('can pass on injected data', async () => {
  const injectedBlock = astNode(
    'block',
    astNode(
      'assign',
      astNode('def', 'InjectedVar'),
      astNode('externalref', 'external-reference-id')
    )
  );
  injectedBlock.id = 'injectblock';

  const externalData: AnyMapping<Result.Result> = {
    'external-reference-id': {
      type: serializeType(t.column(t.string())),
      value: ['Hello', 'World'],
    },
  };
  expect(
    await computeOnTestComputer({
      program: [
        {
          type: 'identified-block',
          id: 'injectblock',
          block: injectedBlock,
        },

        ...getIdentifiedBlocks('InjectedVar'),
      ],

      externalData,
    })
  ).toMatchInlineSnapshot(`
    Array [
      "injectblock -> [\\"Hello\\", \\"World\\"]",
      "block-0 -> [\\"Hello\\", \\"World\\"]",
    ]
  `);
});

it('can accept program bits', async () => {
  computer.pushCompute({
    program: makeTestProgram('Var1'),
  });
  await timeout(0); // give time to compute

  expect(
    computer.getBlockIdResult('block-0')?.result?.value
    // undefined
  ).toMatchInlineSnapshot(`DeciNumber(1)`);

  computer.pushExtraProgramBlocks('new-stuff', [
    {
      type: 'identified-block',
      id: 'new-stuff-id',
      block: parseBlockOrThrow('Var1 = 42', 'new-stuff-id'),
    },
  ]);
  await timeout(0); // give time to compute

  expect(
    computer.getBlockIdResult('block-0')?.result?.value
    // Var1 is defined now
  ).toMatchInlineSnapshot(`DeciNumber(42)`);

  computer.pushExtraProgramBlocksDelete('new-stuff');
  await timeout(0); // give time to compute

  expect(
    computer.getBlockIdResult('block-0')?.result?.value
    // undefined again
  ).toMatchInlineSnapshot(`DeciNumber(1)`);
});

describe('tooling data', () => {
  it('Can get variables and functions available', async () => {
    await computeOnTestComputer({
      program: getIdentifiedBlocks('A = 1', 'f(x) = 1', 'C = 3'),
    });

    const names = computer.getNamesDefined();
    expect(names).toMatchObject([
      {
        kind: 'variable',
        name: 'A',
        type: { kind: 'number' },
      },
      {
        kind: 'function',
        name: 'f',
        type: { kind: 'function' },
      },
      {
        kind: 'variable',
        name: 'C',
        type: { kind: 'number' },
      },
    ]);
  });

  it('can get a statement', async () => {
    await computeOnTestComputer({ program: getIdentifiedBlocks('1 + 1') });

    expect(computer.getStatement('block-0')?.args[1]).toMatchObject({
      type: 'function-call',
    });

    expect(computer.getStatement('block-1')).toEqual(undefined);
  });
});

it('can extract units from text', async () => {
  await computeOnTestComputer({
    program: getIdentifiedBlocks('Foo = 30cmeter', 'Bar = 30'),
  });

  // Internal units
  let units = await computer.getUnitFromText('W');
  expect(units?.[0].unit).toBe('W');
  units = await computer.getUnitFromText('kmeter/h');
  expect(units?.[0].unit).toBe('h');
  expect(units?.[1].unit).toBe('meters');

  // Custom units
  units = await computer.getUnitFromText('Bananas');
  expect(units?.[0].unit).toBe('Bananas');
  units = await computer.getUnitFromText('Foo');
  expect(units?.[0].unit).toBe('meters');

  // Non units
  units = await computer.getUnitFromText('Bar');
  expect(units).toBeNull();
  units = await computer.getUnitFromText('10');
  expect(units).toBeNull();
});

it('can get a expression from text in streaming mode', async () => {
  await computeOnTestComputer({
    program: getIdentifiedBlocks('Time = 120 minutes'),
  });

  const TimeStream = computer.expressionResultFromText$('Time in hours');

  const firstTime = await firstValueFrom(TimeStream);

  expect(firstTime?.value?.toString()).toBe('2');
});

it('regression: can describe tables correctly', async () => {
  const res = await computeOnTestComputer({
    program: getIdentifiedBlocks(
      `Table = {}`,
      `Table.One = ["A", "B"]`,
      `Table.Two = ["c", "d"]`
    ),
  });

  expect(res).toMatchInlineSnapshot(`
    Array [
      "block-0 -> [[\\"A\\", \\"B\\"], [\\"c\\", \\"d\\"]]",
      "block-1 -> [\\"A\\", \\"B\\"]",
      "block-2 -> [\\"c\\", \\"d\\"]",
    ]
  `);
});

it('regression: can describe partially good tables', async () => {
  const res = await computeOnTestComputer({
    program: getIdentifiedBlocks(
      `Table = {}`,
      `Table.One = 1 + "a"`,
      `Table.Two = ["c", "d"]`
    ),
  });

  expect(res).toMatchInlineSnapshot(`
    Array [
      "block-0 -> [[\\"c\\", \\"d\\"]]",
      "block-1 -> Error in operation \\"+\\" (number, string): The function + cannot be called with (number, string)",
      "block-2 -> [\\"c\\", \\"d\\"]",
    ]
  `);
});

it('getBlockIdResult$', async () => {
  computer.pushCompute({
    program: getIdentifiedBlocks('123'),
  });

  await timeout(200);

  const x = await firstValueFrom(
    computer.getBlockIdResult$
      .observeWithSelector((item) => item?.result?.type.kind, 'block-0')
      .pipe(filter((item) => item != null))
  );

  expect(x).toMatchInlineSnapshot(`"number"`);
});

it('getFunctionDefinition$', async () => {
  computer.pushCompute({
    program: getIdentifiedBlocks('f(x) = 2'),
  });

  const x = await firstValueFrom(
    computer.getFunctionDefinition$
      .observeWithSelector((item) => item, 'f')
      .pipe(filter((item) => item != null))
  );

  expect(x?.args[0].args[0]).toMatchInlineSnapshot(`"f"`);
});

describe('getVarBlockId$', () => {
  it('can get a variable block id in streaming', async () => {
    await computeOnTestComputer({
      program: getIdentifiedBlocks('Foo = 420'),
    });

    const fooStream = computer.getVarBlockId$.observe('Foo');

    const firstFoo = await firstValueFrom(fooStream);

    expect(firstFoo).toBe('block-0');
  });

  it('can get a variable block id from a table in streaming', async () => {
    await computeOnTestComputer({
      program: getIdentifiedBlocks('C = 1', 'A = { B = 420 } '),
    });

    const fooStream = computer.getVarBlockId$.observe('A.B');

    const firstFoo = await firstValueFrom(fooStream);

    expect(firstFoo).toBe('block-1');
  });

  it('can find exprRefs', async () => {
    await computeOnTestComputer({
      program: getIdentifiedBlocks('Foo = 420'),
    });

    const fooStream = computer.getVarBlockId$.observe('exprRef_block_0');

    const firstFoo = await firstValueFrom(fooStream);

    expect(firstFoo).toBe('block-0');
  });
});

describe('can retrieve columns indexed by a table', () => {
  let computer: Computer;
  beforeEach(async () => {
    computer = new Computer({
      initialProgram: getIdentifiedBlocks(
        `Table = { }`,
        'Table.Xs = [10, 20, 30]',
        `Table.Xs * 2`
      ),
    });
    await timeout(0);
  });

  it('can get columns indexed by a table', () => {
    expect(computer.getAllColumnsIndexedBy$.get('Table').map(({ id }) => id))
      .toMatchInlineSnapshot(`
        Array [
          "block-1",
          "block-2",
        ]
      `);
  });
});

const materializeColumnDesc = async (desc: ColumnDesc) => ({
  ...desc,
  result: {
    ...desc.result,
    value: await all(getResultGenerator(desc.result.value)()),
  },
});

it('can list tables and columns', async () => {
  const computer = new Computer({
    initialProgram: getIdentifiedBlocks(
      `table = { A = [1], B = ["a"] }`,
      `table.C = [date(2020-01-01)]`,
      `anotherVar = "Not a table"`
    ),
  });

  await timeout(0);

  const columns = computer.getAllColumns$.get();
  const tables = computer.getAllTables$.get();
  expect(await Promise.all(columns.map(materializeColumnDesc)))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "blockId": "block-0_0",
        "columnName": "A",
        "result": Object {
          "type": Object {
            "cellType": Object {
              "kind": "number",
              "unit": null,
            },
            "indexedBy": "table",
            "kind": "column",
          },
          "value": Array [
            DeciNumber(1),
          ],
        },
        "tableName": "table",
      },
      Object {
        "blockId": "block-0_1",
        "columnName": "B",
        "result": Object {
          "type": Object {
            "cellType": Object {
              "kind": "string",
            },
            "indexedBy": "table",
            "kind": "column",
          },
          "value": Array [
            "a",
          ],
        },
        "tableName": "table",
      },
      Object {
        "blockId": "block-1",
        "columnName": "C",
        "result": Object {
          "type": Object {
            "cellType": Object {
              "date": "day",
              "kind": "date",
            },
            "indexedBy": "table",
            "kind": "column",
          },
          "value": Array [
            1577836800000n,
          ],
        },
        "tableName": "table",
      },
    ]
  `);
  expect(tables).toMatchInlineSnapshot(`
    Array [
      Object {
        "id": "block-0",
        "tableName": "table",
      },
    ]
  `);
});

it('can get a result by var', async () => {
  computer.pushCompute({
    program: getIdentifiedBlocks('Foo = 420'),
  });
  await timeout(0);

  expect(computer.getVarResult$.get('Foo')?.id).toMatchInlineSnapshot(
    `"block-0"`
  );
});

it('can get a defined symbol, in block', async () => {
  await computeOnTestComputer({
    program: getIdentifiedBlocks('C = 1', 'C + 2 + A'),
  });

  expect(computer.getSymbolDefinedInBlock('block-0')).toEqual('C');
  expect(computer.getSymbolDefinedInBlock('block-1')).toEqual(undefined);
});

it('can get table/column data by block id', async () => {
  await computeOnTestComputer({
    program: getIdentifiedBlocks('Table = {}', 'Table.Xs = [10, 20, 30]'),
  });

  expect(computer.getBlockIdAndColumnId$.get('block-0')).toMatchInlineSnapshot(`
    Array [
      "block-0",
      null,
    ]
  `);
  expect(computer.getBlockIdAndColumnId$.get('block-1')).toMatchInlineSnapshot(`
    Array [
      "block-0",
      "block-1",
    ]
  `);
  expect(
    computer.getSymbolOrTableDotColumn$.get('block-0', 'block-1')
  ).toMatchInlineSnapshot(`"Table.Xs"`);
});

it('formats stuff', () => {
  expect(
    computer.formatNumber(
      { kind: 'number', numberFormat: 'percentage' },
      N(0.1)
    ).asString
  ).toMatchInlineSnapshot(`"10%"`);

  expect(
    computer.formatError({ errType: 'free-form', message: 'error!' })
  ).toMatchInlineSnapshot(`"error!"`);

  expect(
    computer.formatUnit(
      [{ known: true, multiplier: N(1), unit: 'meter', exp: N(1) }],
      N(1)
    )
  ).toMatchInlineSnapshot(`"meter"`);

  computer.setLocale('pt-PT');
  expect(computer).toHaveProperty('locale', 'pt-PT');
});
