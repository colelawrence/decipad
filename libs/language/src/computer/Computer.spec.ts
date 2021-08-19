import produce from 'immer';

import { AST } from '..';
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
import { Program, UnparsedBlock, ValueLocation } from './types';

let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

const testCompute = async (program: AST.Block[]) =>
  simplifyInBlockResults(await computeProgram(program, new ComputationRealm()));

const computeOnTestComputer = async (program: Program) => {
  const res = await computer.compute({ program });
  return simplifyComputeResponse(res);
};

it('computes a thing', async () => {
  const res = await computeOnTestComputer(unparsedProgram);

  expect(res).toEqual([
    'block-AB/0 -> 0',
    'block-AB/1 -> 1',
    'block-C/0 -> 11',
    'block-D/0 -> 111',
  ]);
});

it('retrieves syntax errors', async () => {
  expect(
    await computeOnTestComputer([
      {
        id: 'wrongblock',
        type: 'unparsed-block',
        source: 'Syntax --/-- Error',
      },
    ])
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
    await computeOnTestComputer(unparsedProgram);

    // Change C
    const changedC = produce(unparsedProgram, (program) => {
      (program[1] as UnparsedBlock).source = 'C = B + 10.1';
    });
    expect(await computeOnTestComputer(changedC)).toMatchObject([
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
    expect(await computeOnTestComputer(broken)).toMatchObject([
      'block-AB/0 -> 0.5',
      'block-C/0 -> Type Error',
      'block-D/0 -> Type Error',
    ]);

    const noD = produce(unparsedProgram, (program) => {
      (program[2] as UnparsedBlock).source = '';
    });
    expect(await computeOnTestComputer(noD)).toMatchObject([
      'block-AB/0 -> 0',
      'block-AB/1 -> 1',
      'block-C/0 -> 11',
    ]);
  });

  it('tricky caching problems', async () => {
    expect(await computeOnTestComputer(getUnparsed('= 1', 'A + 1'))).toContain(
      'block-1/0 -> Type Error'
    );

    expect(await computeOnTestComputer(getUnparsed('A = 1', 'A + 1'))).toEqual([
      'block-0/0 -> 1',
      'block-1/0 -> 2',
    ]);
  });

  it('tricky caching problems (2)', async () => {
    // Use a missing variable B
    expect(
      await computeOnTestComputer(getUnparsed('A = 1', '', 'A + 1 + B'))
    ).toEqual(['block-0/0 -> 1', 'block-2/0 -> Type Error']);

    // Define it out of order
    expect(
      await computeOnTestComputer(
        getUnparsed('A = 1', '', 'A + 1 + B', 'B = 1')
      )
    ).toEqual(['block-0/0 -> 1', 'block-2/0 -> Type Error', 'block-3/0 -> 1']);
  });
});

it('can reset itself', async () => {
  // Make the cache dirty
  await computeOnTestComputer(unparsedProgram);
  expect(computer).not.toEqual(new Computer());

  computer.reset();
  expect(computer).toEqual(new Computer());
});

it('can turn a cursor location into a ValueLocation', async () => {
  await computeOnTestComputer([
    {
      id: 'id',
      type: 'unparsed-block',
      source: ['A = 1', '', '', 'B = 2', 'C = 3'].join('\n'),
    },
  ]);

  const locOf = (loc: ValueLocation | null) =>
    computer.cursorPosToValueLocation(loc);

  expect(locOf(null)).toEqual(null);
  expect(locOf(['missing-id', 0])).toEqual(null);
  expect(locOf(['id', 99999])).toEqual(null);

  expect(locOf(['id', 0])).toEqual(null);
  expect(locOf(['id', 1])).toEqual(['id', 0]);
  expect(locOf(['id', 2])).toEqual(null);
  expect(locOf(['id', 3])).toEqual(null);
  expect(locOf(['id', 4])).toEqual(['id', 1]);
  expect(locOf(['id', 5])).toEqual(['id', 2]);
});
