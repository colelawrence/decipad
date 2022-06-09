import {
  AST,
  astNode,
  buildType as t,
  Column,
  InjectableExternalData,
  parseOneStatement,
  RuntimeError,
  Scalar,
} from '@decipad/language';
import { AnyMapping, timeout } from '@decipad/utils';
import produce from 'immer';
import { firstValueFrom } from 'rxjs';
import {
  deeperProgram,
  getUnparsed,
  programContainingError,
  simplifyComputeResponse,
  simplifyInBlockResults,
  unparsedProgram,
} from '../testUtils';
import { ComputeRequest, UnparsedBlock } from '../types';
import { ComputationRealm } from './ComputationRealm';
import { computeProgram, Computer, resultFromError } from './Computer';

let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

const testCompute = async (program: AST.Block[]) =>
  simplifyInBlockResults(await computeProgram(program, new ComputationRealm()));

const computeOnTestComputer = async (req: ComputeRequest) => {
  const res = await computer.computeRequest(req);
  return simplifyComputeResponse(res);
};

it('computes a thing', async () => {
  const res = await computeOnTestComputer({ program: unparsedProgram });

  expect(res).toMatchInlineSnapshot(`
    Array [
      "block-AB/0 -> 0",
      "block-AB/1 -> 1",
      "block-C/0 -> 11",
      "block-D/0 -> 111",
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
      "block-0/0 -> 1",
      "block-0/1 -> 123",
      "block-1/0 -> 2",
      "block-1/1 -> 2",
      "block-1/2 -> 3",
      "block-2/0 -> 2",
      "block-2/1 -> 2",
    ]
  `);
});

it('returns type errors', async () => {
  expect(await testCompute(programContainingError)).toMatchInlineSnapshot(`
    Array [
      "block-0/0 -> 1",
      "block-1/0 -> Type Error",
      "block-2/0 -> 2",
      "block-3/0 -> Type Error",
    ]
  `);
});

describe('caching', () => {
  it('honours cache', async () => {
    // Fill in cache
    await computeOnTestComputer({ program: unparsedProgram });

    // Change C
    const changedC = produce(unparsedProgram, (program) => {
      (program[1] as UnparsedBlock).source = 'C = B + 10.1';
    });
    expect(await computeOnTestComputer({ program: changedC }))
      .toMatchInlineSnapshot(`
        Array [
          "block-AB/0 -> 0",
          "block-AB/1 -> 1",
          "block-C/0 -> 11.1",
          "block-D/0 -> 111.1",
        ]
      `);

    computer.reset();

    // Break it by removing B
    const broken = produce(unparsedProgram, (program) => {
      (program[0] as UnparsedBlock).source = 'A = 0.5';
    });
    expect(await computeOnTestComputer({ program: broken }))
      .toMatchInlineSnapshot(`
      Array [
        "block-AB/0 -> 0.5",
        "block-C/0 -> 11",
        "block-D/0 -> 111",
      ]
    `);

    const noD = produce(unparsedProgram, (program) => {
      (program[2] as UnparsedBlock).source = '';
    });
    expect(await computeOnTestComputer({ program: noD }))
      .toMatchInlineSnapshot(`
        Array [
          "block-AB/0 -> 0",
          "block-AB/1 -> 1",
          "block-C/0 -> 11",
          "block-D/0 -> undefined",
        ]
      `);
  });

  it('tricky caching problems', async () => {
    expect(
      await computeOnTestComputer({ program: getUnparsed('= 1', 'A + 1') })
    ).toContain('block-1/0 -> 2');

    expect(
      await computeOnTestComputer({ program: getUnparsed('A = 1', 'A + 1') })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0/0 -> 1",
        "block-1/0 -> 2",
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
        "block-0/0 -> 1",
        "block-1/0 -> undefined",
        "block-2/0 -> 3",
      ]
    `);

    // Define it out of order
    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 1', '', 'A + 1 + B', 'B = 1'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0/0 -> 1",
        "block-1/0 -> undefined",
        "block-2/0 -> 3",
        "block-3/0 -> 1",
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
        "block-0/0 -> 3",
        "block-1/0 -> 3",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 4'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0/0 -> 4",
      ]
    `);

    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 5', 'previous'),
      })
    ).toMatchInlineSnapshot(`
      Array [
        "block-0/0 -> 5",
        "block-1/0 -> 5",
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
    ),
    astNode('ref', 'InjectedVar')
  );
  injectedBlock.id = 'blockid';
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
          id: 'id',
          type: 'parsed-block',
          block: injectedBlock,
        },
      ],

      externalData,
    })
  ).toMatchInlineSnapshot(`
    Array [
      "blockid/0 -> [\\"Hello\\",\\"World\\"]",
      "blockid/1 -> [\\"Hello\\",\\"World\\"]",
    ]
  `);
});

describe('tooling data', () => {
  it('Can get variables and functions available until a certain location (exclusive)', async () => {
    await computeOnTestComputer({
      program: getUnparsed('A = 1', 'f(x) = 1\nC = 3'),
    });

    const names = await computer.getNamesDefinedBefore(['block-1', 1]);
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
    ]);
  });

  it('can figure out if a statement is a basic lit or assignment', () => {
    expect(computer.isLiteralValueOrAssignment(parseOneStatement('1'))).toEqual(
      true
    );
    expect(
      computer.isLiteralValueOrAssignment(parseOneStatement('1 + 1'))
    ).toEqual(false);

    expect(
      computer.isLiteralValueOrAssignment(parseOneStatement('Var = 1'))
    ).toEqual(true);
    expect(
      computer.isLiteralValueOrAssignment(parseOneStatement('Var = 1 + 1'))
    ).toEqual(false);
  });

  it('can get a statement', () => {
    computeOnTestComputer({ program: getUnparsed('1 + 1') });

    expect(computer.getStatement('block-0', 0)).toMatchObject({
      type: 'function-call',
    });

    expect(computer.getStatement('block-0', 999)).toEqual(null);
    expect(computer.getStatement('block-1', 0)).toEqual(null);
  });
});

it('creates a result from an error', () => {
  expect(resultFromError(new RuntimeError('Message!'), ['blockid', 3]).type)
    .toMatchInlineSnapshot(`
    Object {
      "errorCause": Object {
        "errType": "free-form",
        "message": "Message!",
      },
      "kind": "type-error",
    }
  `);

  expect(resultFromError(new Error('panic: Message!'), ['blockid', 3]).type)
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
  expect(units?.args[0].unit).toBe('W');
  units = await computer.getUnitFromText('km/h');
  expect(units?.args[0].unit).toBe('h');
  expect(units?.args[1].unit).toBe('m');

  // Custom units
  units = await computer.getUnitFromText('Bananas');
  expect(units?.args[0].unit).toBe('Bananas');
  units = await computer.getUnitFromText('Foo');
  expect(units?.args[0].unit).toBe('m');

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
