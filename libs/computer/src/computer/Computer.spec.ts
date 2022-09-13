import {
  AST,
  astNode,
  buildType as t,
  Column,
  InjectableExternalData,
  RuntimeError,
  Scalar,
} from '@decipad/language';
import { AnyMapping, timeout } from '@decipad/utils';
import produce from 'immer';
import { firstValueFrom } from 'rxjs';
import { getExprRef } from '../exprRefs';
import {
  deeperProgram,
  getIdentifiedBlocks,
  getUnparsed,
  programContainingError,
  simplifyComputeResponse,
  simplifyInBlockResults,
  unparsedProgram,
} from '../testUtils';
import { ComputeRequestWithExternalData, UnparsedBlock } from '../types';
import { ComputationRealm } from './ComputationRealm';
import { computeProgram, Computer, resultFromError } from './Computer';

let computer: Computer;
beforeEach(() => {
  computer = new Computer({ requestDebounceMs: 1 });
});

const testCompute = async (program: AST.Block[]) =>
  simplifyInBlockResults(await computeProgram(program, new ComputationRealm()));

const computeOnTestComputer = async (req: ComputeRequestWithExternalData) => {
  const res = await computer.computeRequest(req);
  return simplifyComputeResponse(res);
};

it('computes a thing', async () => {
  const res = await computeOnTestComputer({ program: unparsedProgram });

  expect(res).toMatchInlineSnapshot(`
    Array [
      "block-A -> 0",
      "block-B -> 1",
      "block-C -> 11",
      "block-D -> 111",
    ]
  `);
});

it('retrieves syntax errors', async () => {
  expect(
    await computeOnTestComputer({
      program: [
        {
          id: 'wrongblock',
          type: 'unparsed-block',
          source: 'Syntax --/-- Error',
        },
      ],
    })
  ).toEqual(['wrongblock -> Syntax Error']);
});

it('infers+evaluates a deep program', async () => {
  expect(await testCompute(deeperProgram)).toMatchInlineSnapshot(`
    Array [
      "block-0 -> 1",
      "block-1 -> 123",
      "block-2 -> 2",
      "block-3 -> 2",
      "block-4 -> 3",
      "block-5 -> 2",
      "block-6 -> 2",
    ]
  `);
});

it('returns type errors', async () => {
  expect(await testCompute(programContainingError)).toMatchInlineSnapshot(`
    Array [
      "block-0 -> 1",
      "block-1 -> Type Error",
      "block-2 -> 2",
      "block-3 -> Type Error",
    ]
  `);
});

describe('caching', () => {
  it('honours cache', async () => {
    // Fill in cache
    await computeOnTestComputer({ program: unparsedProgram });

    // Change C
    const changedC = produce(unparsedProgram, (program) => {
      (program[2] as UnparsedBlock).source = 'C = B + 10.1';
    });
    expect(await computeOnTestComputer({ program: changedC }))
      .toMatchInlineSnapshot(`
        Array [
          "block-A -> 0",
          "block-B -> 1",
          "block-C -> 11.1",
          "block-D -> 111.1",
        ]
      `);

    computer.reset();

    // Break it by removing B
    const broken = produce(unparsedProgram, (program) => {
      (program[0] as UnparsedBlock).source = 'A = 0.5';
      program.splice(1, 1);
    });
    expect(await computeOnTestComputer({ program: broken }))
      .toMatchInlineSnapshot(`
        Array [
          "block-A -> 0.5",
          "block-C -> 11",
          "block-D -> 111",
        ]
      `);

    const noD = produce(unparsedProgram, (program) => {
      (program[3] as UnparsedBlock).source = '';
    });
    expect(await computeOnTestComputer({ program: noD }))
      .toMatchInlineSnapshot(`
        Array [
          "block-A -> 0",
          "block-B -> 1",
          "block-C -> 11",
          "block-D -> undefined",
        ]
      `);
  });

  it('tricky caching problems', async () => {
    expect(
      await computeOnTestComputer({ program: getUnparsed('= 1', 'A + 1') })
    ).toContain('block-1 -> 2');

    expect(
      await computeOnTestComputer({ program: getUnparsed('A = 1', 'A + 1') })
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
        program: getUnparsed('A = 1', '', 'A + 1 + B'),
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
        program: getUnparsed('A = 1', '', 'A + 1 + B', 'B = 1'),
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
    program: getUnparsed('AlreadyUsed1 = 1'),
  });

  expect(
    computer.getAvailableIdentifier('AlreadyUsed', 1)
  ).toMatchInlineSnapshot(`"AlreadyUsed2"`);
});

describe('uses previous value', () => {
  it('works the first and second time', async () => {
    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 3', 'previous'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 3",
        "block-1 -> 3",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 4'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0 -> 4",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 5', 'previous'),
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
  await computer.pushCompute({ program: unparsedProgram });
  await timeout(200); // give time to compute
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

  const externalData: AnyMapping<InjectableExternalData> = {
    'external-reference-id': {
      type: t.column(t.string(), 2),
      value: Column.fromValues([
        Scalar.fromValue('Hello'),
        Scalar.fromValue('World'),
      ]),
    },
  };
  expect(
    await computeOnTestComputer({
      program: [
        {
          type: 'identified-block',
          id: 'injectblock',
          block: injectedBlock,
          source: '',
        },

        ...getUnparsed('InjectedVar'),
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
      program: getUnparsed('A = 1', 'f(x) = 1', 'C = 3'),
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

    expect(computer.getStatement('block-0', 0)?.args[1]).toMatchObject({
      type: 'function-call',
    });

    expect(computer.getStatement('block-0', 999)).toEqual(null);
    expect(computer.getStatement('block-1', 0)).toEqual(null);
  });
});

it('creates a result from an error', () => {
  expect(resultFromError(new RuntimeError('Message!'), 'blockid').result.type)
    .toMatchInlineSnapshot(`
    Object {
      "errorCause": Object {
        "errType": "free-form",
        "message": "Message!",
      },
      "kind": "type-error",
    }
  `);

  expect(resultFromError(new Error('panic: Message!'), 'blockid').result.type)
    .toMatchInlineSnapshot(`
    Object {
      "errorCause": Object {
        "errType": "free-form",
        "message": "Internal Error: Message!. Please contact support",
      },
      "kind": "type-error",
    }
  `);
});

it('can extract units from text', async () => {
  await computeOnTestComputer({
    program: getUnparsed('Foo = 30cm', 'Bar = 30'),
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

it('can get a specific variable', async () => {
  await computeOnTestComputer({
    program: getUnparsed('Foo = 30'),
  });

  const foo = await computer.getVariable('Foo');
  expect(foo?.value?.toString()).toBe('30');
});

it('can get a expression from text in streaming mode', async () => {
  await computeOnTestComputer({
    program: getUnparsed('Time = 120 minutes'),
  });

  const TimeStream = computer.expressionResultFromText$('Time in hours');

  const firstTime = await firstValueFrom(TimeStream);

  expect(firstTime?.value?.toString()).toBe('2');
});

it('can get a variable in streaming', async () => {
  await computeOnTestComputer({
    program: getUnparsed('Foo = 420'),
  });

  const fooStream = computer.getVariable$('Foo');

  const firstFoo = await firstValueFrom(fooStream);

  expect(firstFoo?.value?.toString()).toBe('420');
});

it('can get a variable block id in streaming', async () => {
  await computeOnTestComputer({
    program: getUnparsed('Foo = 420'),
  });

  const fooStream = computer.getBlockId$('Foo');

  const firstFoo = await firstValueFrom(fooStream);

  expect(firstFoo).toBe('block-0');
});

it('can get a variable block id from a table in streaming', async () => {
  await computeOnTestComputer({
    program: getUnparsed('C = 1', 'A = { B = 420 } '),
  });

  const fooStream = computer.getBlockId$('A.B');

  const firstFoo = await firstValueFrom(fooStream);

  expect(firstFoo).toBe('block-1');
});

it('can get a defined symbol, in block', async () => {
  await computeOnTestComputer({
    program: getUnparsed('C = 1', 'C + 2 + A'),
  });

  expect(computer.getDefinedSymbolInBlock('block-0')).toEqual('C');
  expect(computer.getDefinedSymbolInBlock('block-1')).toEqual(undefined);
});

it('can stream imperative and computer-driven errors', async () => {
  let errors = new Map<string, unknown>();

  computer.getParseError$().subscribe((map) => {
    errors = new Map([...errors.entries(), ...map.entries()]);
  });

  computer.pushCompute({
    program: [],
    parseErrors: [{ elementId: '1', error: 'err 1' }],
  });

  computer.setParseError('2', { elementId: '2', error: 'err 2' });

  await timeout(1);

  expect(errors).toMatchInlineSnapshot(`
    Map {
      "1" => Object {
        "elementId": "1",
        "error": "err 1",
      },
      "2" => Object {
        "elementId": "2",
        "error": "err 2",
      },
    }
  `);
});
