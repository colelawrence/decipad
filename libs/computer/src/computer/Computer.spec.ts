import { filter, firstValueFrom } from 'rxjs';
import { all } from '@decipad/generator-utils';
import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  serializeType,
  buildType as t,
  astNode,
  parseBlockOrThrow,
  getResultGenerator,
} from '@decipad/language';
import type {
  ColumnDesc,
  ComputeDeltaRequest,
} from '@decipad/computer-interfaces';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import type { AnyMapping } from '@decipad/utils';
import { produce, timeout } from '@decipad/utils';
import { getExprRef } from '../exprRefs';
import {
  getIdentifiedBlock,
  getIdentifiedBlocks,
  testProgram as makeTestProgram,
  simplifyComputeResponse,
} from '../testUtils';
import { Computer } from './Computer';

setupDeciNumberSnapshotSerializer();

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
  req: ComputeDeltaRequest
): Promise<string[]> => {
  const res = await computer.computeDeltaRequest(req);
  return simplifyComputeResponse(res);
};

it('computes a thing', async () => {
  const res = await computeOnTestComputer({ program: { upsert: testProgram } });

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
      program: {
        upsert: getIdentifiedBlocks('Syntax //-// Error'),
      },
    })
  ).toEqual(['block-0 -> Syntax Error']);
});

describe('caching', () => {
  it('honours cache', async () => {
    // Fill in cache
    await computeOnTestComputer({ program: { upsert: testProgram } });

    // Change C
    const changedC = produce(testProgram, (program) => {
      program[2] = getIdentifiedBlock('C = B1 + 10.1', 2);
    });
    expect(await computeOnTestComputer({ program: { upsert: changedC } }))
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
    const broken = produce(testProgram, (program) => {
      program[0] = getIdentifiedBlock('A = 0.5', 0);
      program.splice(1, 1);
    });
    expect(await computeOnTestComputer({ program: { upsert: broken } }))
      .toMatchInlineSnapshot(`
      Array [
        "block-0 -> 0.5",
        "block-2 -> Error in operation \\"+\\" (type-error, number): Unknown reference: B1",
        "block-3 -> Error in operation \\"+\\" (type-error, number): Unknown reference: B1",
      ]
    `);

    const noD = produce(testProgram, (program) => {
      program[3] = getIdentifiedBlock('', 3);
    });
    expect(await computeOnTestComputer({ program: { upsert: noD } }))
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
        program: { upsert: getIdentifiedBlocks('= 1', 'A + 1') },
      })
    ).toContain('block-1 -> 2');

    expect(
      await computeOnTestComputer({
        program: { upsert: getIdentifiedBlocks('A = 1', 'A + 1') },
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
        program: { upsert: getIdentifiedBlocks('A = 1', '', 'A + 1 + C') },
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
        program: {
          upsert: getIdentifiedBlocks('A = 1', '', 'A + 1 + C', 'C = 1'),
        },
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
        program: {
          upsert: getIdentifiedBlocks(
            'Table = {}',
            'Table.A = [1]',
            'Table.B = A + C',
            'C = 1'
          ),
        },
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
        program: {
          upsert: getIdentifiedBlocks(
            'Table = {}',
            'Table.A = [1]',
            'Table.B = A + C',
            'C = 2'
          ),
        },
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
        program: {
          upsert: getIdentifiedBlocks(
            'Table = {}',
            'Table.A = [1]',
            'Table.B = A + C + 1',
            'C = 2'
          ),
        },
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
        program: {
          upsert: getIdentifiedBlocks(getExprRef('block-1'), '1 + 1'),
        },
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
        program: {
          upsert: getIdentifiedBlocks(
            'Table = {}',
            'Table.A = [2]',
            'C = exprRef_block_1'
          ),
        },
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> [[2]]",
        "block-1 -> [2]",
        "block-2 -> [2]",
      ]
    `);
  });
});

it('creates new, unused identifiers', async () => {
  expect(computer.getAvailableIdentifier('Name', 1)).toMatchInlineSnapshot(
    `"Name"`
  );

  await computeOnTestComputer({
    program: { upsert: getIdentifiedBlocks('AlreadyUsed = 1') },
  });

  expect(
    computer.getAvailableIdentifier('AlreadyUsed', 1)
  ).toMatchInlineSnapshot(`"AlreadyUsed1"`);
});

it('can reset itself', async () => {
  // Make the cache dirty
  await computer.pushComputeDelta({ program: { upsert: testProgram } });
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
      program: {
        upsert: [
          {
            type: 'identified-block',
            id: 'injectblock',
            block: injectedBlock,
          },

          ...getIdentifiedBlocks('InjectedVar'),
        ],
      },
      external: {
        upsert: externalData,
      },
    })
  ).toMatchInlineSnapshot(`
    Array [
      "injectblock -> [\\"Hello\\", \\"World\\"]",
      "block-0 -> [\\"Hello\\", \\"World\\"]",
    ]
  `);
});

it('can accept program bits', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: makeTestProgram('Var1'),
    },
  });

  expect(
    (await computer.getBlockIdResult('block-0'))?.result?.value
    // undefined
  ).toMatchInlineSnapshot(`
    DeciNumber {
      "d": 1n,
      "infinite": false,
      "n": 1n,
      "s": 1n,
    }
  `);

  await computer.pushExtraProgramBlocks('new-stuff', [
    {
      type: 'identified-block',
      id: 'new-stuff-id',
      block: parseBlockOrThrow('Var1 = 42', 'new-stuff-id'),
    },
  ]);

  expect(
    (await computer.getBlockIdResult('block-0'))?.result?.value
    // Var1 is defined now
  ).toMatchInlineSnapshot(`
    DeciNumber {
      "d": 1n,
      "infinite": false,
      "n": 42n,
      "s": 1n,
    }
  `);

  await computer.pushExtraProgramBlocksDelete(['new-stuff-id']);

  expect(
    (await computer.getBlockIdResult('block-0'))?.result?.value
    // undefined again
  ).toMatchInlineSnapshot(`Symbol(unknown)`);
});

describe('It can resolve promise on `pushCompute`', () => {
  it('resolves', async () => {
    await expect(
      computer.pushComputeDelta({
        program: {
          upsert: [
            {
              type: 'identified-block',
              id: 'id',
              block: parseBlockOrThrow('Var1 = 5', 'id'),
            },
          ],
        },
      })
    ).resolves.toBe(undefined);
  });

  it('can resolve various `pushCompute` calls', async () => {
    await expect(
      computer.pushComputeDelta({
        program: {
          upsert: [
            {
              type: 'identified-block',
              id: 'id2',
              block: parseBlockOrThrow('Var1 = 5', 'id1'),
            },
          ],
        },
      })
    ).resolves.toBe(undefined);

    await expect(
      computer.pushComputeDelta({
        program: {
          upsert: [
            {
              type: 'identified-block',
              id: 'id2',
              block: parseBlockOrThrow('Var2 = 10', 'id2'),
            },
          ],
        },
      })
    ).resolves.toBe(undefined);
  });

  it('can resolve for the same program, if not waited', async () => {
    const all = await Promise.all([
      computer.pushProgramBlocks([
        {
          type: 'identified-block',
          id: 'id2',
          block: parseBlockOrThrow('Var2 = 10', 'id2'),
        },
      ]),
      computer.pushProgramBlocks([
        {
          type: 'identified-block',
          id: 'id2',
          block: parseBlockOrThrow('Var2 = 10', 'id2'),
        },
      ]),
      computer.pushProgramBlocks([
        {
          type: 'identified-block',
          id: 'id2',
          block: parseBlockOrThrow('Var2 = 10', 'id2'),
        },
      ]),
    ]);

    expect(all).toBeDefined();
  });
});

describe('tooling data', () => {
  it('Can get variables and functions available', async () => {
    await computeOnTestComputer({
      program: {
        upsert: getIdentifiedBlocks('A = 1', 'f(x) = 1', 'C = 3'),
      },
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
    await computeOnTestComputer({
      program: { upsert: getIdentifiedBlocks('1 + 1') },
    });

    expect((await computer.getStatement('block-0'))?.args[1]).toMatchObject({
      type: 'function-call',
    });

    expect(await computer.getStatement('block-1')).toEqual(undefined);
  });
});

it('can extract units from text', async () => {
  await computeOnTestComputer({
    program: {
      upsert: getIdentifiedBlocks('Foo = 30cmeter', 'Bar = 30'),
    },
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
    program: {
      upsert: getIdentifiedBlocks('Time = 120 minutes'),
    },
  });

  const TimeStream = computer.expressionResultFromText$('Time in hours');

  const firstTime = await firstValueFrom(TimeStream);

  expect(firstTime?.value?.toString()).toBe('2');
});

it('regression: can describe tables correctly', async () => {
  const res = await computeOnTestComputer({
    program: {
      upsert: getIdentifiedBlocks(
        `Table = {}`,
        `Table.One = ["A", "B"]`,
        `Table.Two = ["c", "d"]`
      ),
    },
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
    program: {
      upsert: getIdentifiedBlocks(
        `Table = {}`,
        `Table.One = 1 + "a"`,
        `Table.Two = ["c", "d"]`
      ),
    },
  });

  expect(res).toMatchInlineSnapshot(`
    Array [
      "block-0 -> [[], [\\"c\\", \\"d\\"]]",
      "block-1 -> Error in operation \\"+\\" (number, string): The function + cannot be called with (number, string)",
      "block-2 -> [\\"c\\", \\"d\\"]",
    ]
  `);
});

it('getBlockIdResult$', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: getIdentifiedBlocks('123'),
    },
  });

  const x = await firstValueFrom(
    computer.getBlockIdResult$
      .observeWithSelector((item) => item?.result?.type.kind, 'block-0')
      .pipe(filter((item) => item != null))
  );

  expect(x).toMatchInlineSnapshot(`"number"`);
});

it('getFunctionDefinition$', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: getIdentifiedBlocks('f(x) = 2'),
    },
  });

  const x = await firstValueFrom(
    computer.getFunctionDefinition$
      .observeWithSelector((item) => item, 'f')
      .pipe(filter((item) => item != null))
  );

  expect(x?.args[0].args[0]).toMatchInlineSnapshot(`"exprRef_block_0"`);
});

describe('getVarBlockId$', () => {
  it('can get a variable block id in streaming', async () => {
    await computeOnTestComputer({
      program: {
        upsert: getIdentifiedBlocks('Foo = 420'),
      },
    });

    const fooStream = computer.getVarBlockId$.observe('Foo');

    const firstFoo = await firstValueFrom(fooStream);

    expect(firstFoo).toBe('block-0');
  });

  it('can get a variable block id from a table in streaming', async () => {
    await computeOnTestComputer({
      program: {
        upsert: getIdentifiedBlocks('C = 1', 'A = { B = 420 } '),
      },
    });

    const fooStream = computer.getVarBlockId$.observe('A.B');

    const firstFoo = await firstValueFrom(fooStream);

    expect(firstFoo).toBe('block-1');
  });

  it('can find exprRefs', async () => {
    await computeOnTestComputer({
      program: {
        upsert: getIdentifiedBlocks('Foo = 420'),
      },
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
    expect(
      computer.getAllColumnsIndexedBy$.get('Table').map(({ id }) => id)
    ).toMatchInlineSnapshot(`Array []`);
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
        "blockType": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_block_0",
          "kind": "column",
        },
        "columnName": "A",
        "readableTableName": "table",
        "result": Object {
          "type": Object {
            "cellType": Object {
              "kind": "number",
              "unit": null,
            },
            "indexedBy": "exprRef_block_0",
            "kind": "column",
          },
          "value": Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
        },
        "tableName": "exprRef_block_0",
      },
      Object {
        "blockId": "block-0_1",
        "blockType": Object {
          "cellType": Object {
            "kind": "string",
          },
          "indexedBy": "exprRef_block_0",
          "kind": "column",
        },
        "columnName": "B",
        "readableTableName": "table",
        "result": Object {
          "type": Object {
            "cellType": Object {
              "kind": "string",
            },
            "indexedBy": "exprRef_block_0",
            "kind": "column",
          },
          "value": Array [
            "a",
          ],
        },
        "tableName": "exprRef_block_0",
      },
      Object {
        "blockId": "block-1",
        "blockType": Object {
          "cellType": Object {
            "date": "day",
            "kind": "date",
          },
          "indexedBy": "exprRef_block_0",
          "kind": "column",
        },
        "columnName": "C",
        "readableTableName": "table",
        "result": Object {
          "type": Object {
            "cellType": Object {
              "date": "day",
              "kind": "date",
            },
            "indexedBy": "exprRef_block_0",
            "kind": "column",
          },
          "value": Array [
            1577836800000n,
          ],
        },
        "tableName": "exprRef_block_0",
      },
    ]
  `);
  expect(tables).toMatchInlineSnapshot(`
    Array [
      Object {
        "id": "block-0",
        "tableName": "exprRef_block_0",
      },
    ]
  `);
});

it('can get a result by var', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: getIdentifiedBlocks('Foo = 420'),
    },
  });

  expect(computer.getVarResult$.get('Foo')?.id).toMatchInlineSnapshot(
    `"block-0"`
  );
});

it('can get a defined symbol, in block', async () => {
  await computeOnTestComputer({
    program: {
      upsert: getIdentifiedBlocks('C = 1', 'C + 2 + A'),
    },
  });

  expect(computer.getSymbolDefinedInBlock('block-0')).toEqual('C');
  expect(computer.getSymbolDefinedInBlock('block-1')).toEqual(
    'exprRef_block_1'
  );
});

it('can get table/column data by block id', async () => {
  await computeOnTestComputer({
    program: {
      upsert: getIdentifiedBlocks('Table = {}', 'Table.Xs = [10, 20, 30]'),
    },
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
