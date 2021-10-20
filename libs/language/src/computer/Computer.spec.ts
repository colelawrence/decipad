import produce from 'immer';

import {
  AST,
  InjectableExternalData,
  buildType as t,
  Scalar,
  Column,
} from '..';
import {
  unparsedProgram,
  deeperProgram,
  programContainingError,
  simplifyInBlockResults,
  simplifyComputeResponse,
  getUnparsed,
} from './testutils';
import { ComputationRealm } from './ComputationRealm';
import { computeProgram, Computer } from './Computer';
import { ComputeRequest, UnparsedBlock, ValueLocation } from './types';
import { AnyMapping, assign, n } from '../utils';

let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

const testCompute = async (program: AST.Block[]) =>
  simplifyInBlockResults(await computeProgram(program, new ComputationRealm()));

const computeOnTestComputer = async (req: ComputeRequest) => {
  const res = await computer.compute(req);
  return simplifyComputeResponse(res);
};

it('computes a thing', async () => {
  const res = await computeOnTestComputer({ program: unparsedProgram });

  expect(res).toEqual([
    'block-AB/0 -> 0',
    'block-AB/1 -> 1',
    'block-C/0 -> 11',
    'block-D/0 -> 111',
  ]);
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
  expect(await testCompute(deeperProgram)).toEqual([
    'block-0/0 -> 1',
    'block-0/1 -> 123',
    'block-1/0 -> 2',
    'block-1/1 -> 2',
    'block-1/2 -> 3',
    'block-2/0 -> 2',
    'block-2/1 -> 2',
  ]);
});

it('returns type errors', async () => {
  expect(await testCompute(programContainingError)).toEqual([
    'block-0/0 -> 1',
    'block-0/1 -> Type Error',
    'block-0/2 -> 2',
    'block-0/3 -> Type Error',
  ]);
});

describe('caching', () => {
  it('honours cache', async () => {
    // Fill in cache
    await computeOnTestComputer({ program: unparsedProgram });

    // Change C
    const changedC = produce(unparsedProgram, (program) => {
      (program[1] as UnparsedBlock).source = 'C = B + 10.1';
    });
    expect(await computeOnTestComputer({ program: changedC })).toMatchObject([
      'block-AB/0 -> 0',
      'block-AB/1 -> 1',
      'block-C/0 -> 11.1',
      'block-D/0 -> 111.1',
    ]);

    computer.reset();

    // Break it by removing B
    const broken = produce(unparsedProgram, (program) => {
      (program[0] as UnparsedBlock).source = 'A = 0.5';
    });
    expect(await computeOnTestComputer({ program: broken })).toMatchObject([
      'block-AB/0 -> 0.5',
      'block-C/0 -> Type Error',
      'block-D/0 -> Type Error',
    ]);

    const noD = produce(unparsedProgram, (program) => {
      (program[2] as UnparsedBlock).source = '';
    });
    expect(await computeOnTestComputer({ program: noD })).toMatchObject([
      'block-AB/0 -> 0',
      'block-AB/1 -> 1',
      'block-C/0 -> 11',
    ]);
  });

  it('tricky caching problems', async () => {
    expect(
      await computeOnTestComputer({ program: getUnparsed('= 1', 'A + 1') })
    ).toContain('block-1/0 -> Type Error');

    expect(
      await computeOnTestComputer({ program: getUnparsed('A = 1', 'A + 1') })
    ).toEqual(['block-0/0 -> 1', 'block-1/0 -> 2']);
  });

  it('tricky caching problems (2)', async () => {
    // Use a missing variable B
    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 1', '', 'A + 1 + B'),
      })
    ).toEqual(['block-0/0 -> 1', 'block-2/0 -> Type Error']);

    // Define it out of order
    expect(
      await computeOnTestComputer({
        program: getUnparsed('A = 1', '', 'A + 1 + B', 'B = 1'),
      })
    ).toEqual(['block-0/0 -> 1', 'block-2/0 -> Type Error', 'block-3/0 -> 1']);
  });
});

it('can reset itself', async () => {
  // Make the cache dirty
  await computeOnTestComputer({ program: unparsedProgram });
  expect(computer).not.toEqual(new Computer());

  computer.reset();
  expect(computer).toEqual(new Computer());
});

it('can turn a cursor location into a ValueLocation', async () => {
  await computeOnTestComputer({
    program: [
      {
        id: 'id',
        type: 'unparsed-block',
        source: ['A = 1', '', '', 'B = 2', 'C = 3'].join('\n'),
      },
    ],
  });

  const locOf = (loc: ValueLocation | null) =>
    computer.cursorPosToValueLocation(loc);

  expect(locOf(null)).toEqual(null);
  expect(locOf(['missing-id', 0])).toEqual(null);
  expect(locOf(['id', 99999])).toEqual(['id', null]);

  expect(locOf(['id', 0])).toEqual(['id', null]);
  expect(locOf(['id', 1])).toEqual(['id', 0]);
  expect(locOf(['id', 2])).toEqual(['id', null]);
  expect(locOf(['id', 3])).toEqual(['id', null]);
  expect(locOf(['id', 4])).toEqual(['id', 1]);
  expect(locOf(['id', 5])).toEqual(['id', 2]);
});

it('can pass on injected data', async () => {
  const injectedBlock = n(
    'block',
    assign('InjectedVar', n('externalref', 'external-reference-id')),
    n('ref', 'InjectedVar')
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
  it('Can get variables and functions available until a certain location', async () => {
    await computeOnTestComputer({
      program: getUnparsed('A = 1', 'function f(x) => 1\nC = 3'),
    });

    const names = await computer.getAutocompleteNames(['block-1', 0]);
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
});
