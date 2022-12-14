import { F } from '@decipad/fraction';
import {
  astNode,
  buildType as t,
  Result,
  serializeType,
} from '@decipad/language';
import { AnyMapping, getDefined, timeout } from '@decipad/utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AsciiTable from 'ascii-table';
import produce from 'immer';
import { filter, firstValueFrom } from 'rxjs';
import { getExprRef } from '../exprRefs';
import {
  getIdentifiedBlock,
  getIdentifiedBlocks,
  simplifyComputeResponse,
} from '../testUtils';
import { unnestTableRows } from '../tools/unnestTableRows';
import { ComputeRequestWithExternalData, UserParseError } from '../types';
import { Computer } from './Computer';

const testProgram = getIdentifiedBlocks(
  'A = 0',
  'B = A + 1',
  'C = B + 10',
  'D = C + 100'
);
let computer: Computer;
beforeEach(() => {
  computer = new Computer({ requestDebounceMs: 0 });
});

const computeOnTestComputer = async (req: ComputeRequestWithExternalData) => {
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
    const changedC = produce(testProgram, (program) => {
      program[2] = getIdentifiedBlock('C = B + 10.1', 2);
    });
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
    const broken = produce(testProgram, (program) => {
      program[0] = getIdentifiedBlock('A = 0.5', 0);
      program.splice(1, 1);
    });
    expect(await computeOnTestComputer({ program: broken }))
      .toMatchInlineSnapshot(`
        Array [
          "block-0 -> 0.5",
          "block-2 -> 11",
          "block-3 -> 111",
        ]
      `);

    const noD = produce(testProgram, (program) => {
      program[3] = getIdentifiedBlock('', 3);
    });
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
        program: getIdentifiedBlocks('A = 1', '', 'A + 1 + B'),
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
        program: getIdentifiedBlocks('A = 1', '', 'A + 1 + B', 'B = 1'),
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
  await computer.pushCompute({ program: testProgram });
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
      type: serializeType(t.column(t.string(), 2)),
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
      "injectblock -> [\\"Hello\\",\\"World\\"]",
      "block-0 -> [\\"Hello\\",\\"World\\"]",
    ]
  `);
});

describe('tooling data', () => {
  it('Can get variables and functions available', async () => {
    await computeOnTestComputer({
      program: getIdentifiedBlocks('A = 1', 'f(x) = 1', 'C = 3'),
    });

    const names = await computer.getNamesDefined();
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

  it('can get a statement', () => {
    computeOnTestComputer({ program: getIdentifiedBlocks('1 + 1') });

    expect(computer.getStatement('block-0')?.args[1]).toMatchObject({
      type: 'function-call',
    });

    expect(computer.getStatement('block-1')).toEqual(undefined);
  });
});

it('can extract units from text', async () => {
  await computeOnTestComputer({
    program: getIdentifiedBlocks('Foo = 30cm', 'Bar = 30'),
  });

  // Internal units
  let units = await computer.getUnitFromText('W');
  expect(units?.[0].unit).toBe('W');
  units = await computer.getUnitFromText('km/h');
  expect(units?.[0].unit).toBe('h');
  expect(units?.[1].unit).toBe('m');

  // Custom units
  units = await computer.getUnitFromText('Bananas');
  expect(units?.[0].unit).toBe('Bananas');
  units = await computer.getUnitFromText('Foo');
  expect(units?.[0].unit).toBe('m');

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

it('getBlockIdResult$', async () => {
  computer.pushCompute({
    program: getIdentifiedBlocks('123'),
  });

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

it('can list tables and columns', async () => {
  const computer = new Computer({ requestDebounceMs: 0 });

  computer.pushCompute({
    program: getIdentifiedBlocks(
      `table = { A = [1], B = ["a"] }`,
      `anotherVar = "Not a table"`
    ),
  });

  await timeout(0);

  const columns = computer.getAllColumns$.get();
  const tables = computer.getAllTables$.get();
  expect(columns).toMatchInlineSnapshot(`
    Array [
      Object {
        "colValues": Array [
          Fraction(1),
        ],
        "name": "table.A",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      },
      Object {
        "colValues": Array [
          "a",
        ],
        "name": "table.B",
        "type": Object {
          "kind": "string",
        },
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

describe('can provide information for rendering matrices', () => {
  let computer: Computer;
  beforeEach(async () => {
    computer = new Computer({ requestDebounceMs: 0 });
    computer.pushCompute({
      program: getIdentifiedBlocks(
        `Table = { Xs = [10, 20, 30] }`,
        `Matrix = [100, 200] * Table.Xs`
      ),
    });
    await timeout(0);
  });

  it('can retrieve labels', () => {
    expect(
      computer.explainDimensions$.get(
        computer.getBlockIdResult$.get('block-1')
          ?.result as Result.Result<'column'>
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "dimensionLength": 2,
          "indexedBy": undefined,
          "labels": undefined,
        },
        Object {
          "dimensionLength": 3,
          "indexedBy": "Table",
          "labels": Array [
            "10",
            "20",
            "30",
          ],
        },
      ]
    `);
  });

  it('can turn nested matrices to a tabular data format', () => {
    const result = getDefined(
      computer.getBlockIdResult$.get('block-1')?.result
    ) as Result.Result<'column'>;
    const dimExplanation = getDefined(computer.explainDimensions$.get(result));

    const aTable = new AsciiTable('Matrix');

    aTable.setHeading(
      ...dimExplanation.map((v) => v.indexedBy ?? '(no dimension)')
    );

    for (const {
      labelInfo,
      result: { value },
    } of unnestTableRows(dimExplanation, result)) {
      aTable.addRow(
        ...labelInfo.map((label) => label.label ?? label.indexAtThisDimension),
        value
      );
    }

    expect(aTable.toString()).toMatchInlineSnapshot(`
      ".-------------------------------.
      |            Matrix             |
      |-------------------------------|
      | (no dimension) | Table |      |
      |----------------|-------|------|
      |              0 | 10    | 1000 |
      |              0 | 20    | 2000 |
      |              0 | 30    | 3000 |
      |              1 | 10    | 2000 |
      |              1 | 20    | 4000 |
      |              1 | 30    | 6000 |
      '-------------------------------'"
    `);
  });
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

it('can stream imperative errors', async () => {
  let error: UserParseError | undefined;

  computer.getImperativeParseError$.observe('1').subscribe((item) => {
    error = item;
  });

  computer.imperativelySetParseError('1', { elementId: '1', error: 'err' });

  await timeout(0);

  expect(error).toMatchInlineSnapshot(`
    Object {
      "elementId": "1",
      "error": "err",
    }
  `);

  computer.imperativelyUnsetParseError('1');
  await timeout(0);
  expect(error).toEqual(undefined);
});

it('formats stuff', () => {
  expect(
    computer.formatNumber(
      { kind: 'number', numberFormat: 'percentage' },
      F(0.1)
    ).asString
  ).toMatchInlineSnapshot(`"10%"`);

  expect(
    computer.formatError({ errType: 'free-form', message: 'error!' })
  ).toMatchInlineSnapshot(`"error!"`);

  expect(
    computer.formatUnit(
      [{ known: true, multiplier: F(1), unit: 'meter', exp: F(1) }],
      F(1)
    )
  ).toMatchInlineSnapshot(`"meter"`);

  computer.setLocale('pt-PT');
  expect(computer).toHaveProperty('locale', 'pt-PT');
});
