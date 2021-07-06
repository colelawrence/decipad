import produce from 'immer';

import { InferError, Type } from '../type';

import {
  unparsedProgram,
  program,
  deeperProgram,
  programContainingError,
} from './testutils';
import { TestComputationRealm } from './ComputationRealm';
import { computeProgram, Computer } from './Computer';

let computer;
beforeEach(() => {
  computer = new Computer();
});
const computeOnTestComputer = (program, subscriptions) =>
  computer.compute({ program, subscriptions });

it('computes a thing', async () => {
  const res = await computeOnTestComputer(unparsedProgram, [
    'block-AB',
    'block-D',
  ]);

  expect(res).toEqual({
    type: 'compute-response',
    updates: [
      {
        blockId: 'block-AB',
        isSyntaxError: false,
        results: [
          {
            blockId: 'block-AB',
            statementIndex: 0,
            value: 0,
            valueType: Type.Number,
          },
          {
            blockId: 'block-AB',
            statementIndex: 1,
            value: 1,
            valueType: Type.Number,
          },
        ],
      },
      {
        blockId: 'block-C',
        isSyntaxError: false,
        results: [
          {
            blockId: 'block-C',
            statementIndex: 0,
            value: 11,
            valueType: Type.Number,
          },
        ],
      },
      {
        blockId: 'block-D',
        isSyntaxError: false,
        results: [
          {
            blockId: 'block-D',
            statementIndex: 0,
            value: 111,
            valueType: Type.Number,
          },
        ],
      },
    ],
  });
});

it('retrieves syntax errors', async () => {
  expect(
    await computeOnTestComputer([
      {
        id: 'wrongblock',
        source: 'Syntax --/-- Error',
      },
    ])
  ).toEqual({
    type: 'compute-response',
    updates: [
      {
        blockId: 'wrongblock',
        isSyntaxError: true,
        results: [],
      },
    ],
  });
});

const testCompute = (program, ...locations) =>
  // The TestComputationRealm always returns that the thing is in cache already
  // this means that only targets get recomputed
  computeProgram(program, locations, new TestComputationRealm([], []));

it('infers+evaluates a program', async () => {
  expect(await testCompute(program, 'block-0')).toEqual([
    {
      blockId: 'block-0',
      isSyntaxError: false,
      results: [
        {
          blockId: 'block-0',
          statementIndex: 0,
          valueType: Type.Number,
          value: 1,
        },
        {
          blockId: 'block-0',
          statementIndex: 1,
          valueType: Type.Number,
          value: 123,
        },
      ],
    },
  ]);
});

it('infers+evaluates a deep program', async () => {
  expect(await testCompute(deeperProgram, 'block-2')).toEqual([
    {
      blockId: 'block-1',
      isSyntaxError: false,
      results: [
        {
          blockId: 'block-1',
          statementIndex: 0,
          value: 2,
          valueType: Type.Number,
        },
      ],
    },
    {
      blockId: 'block-2',
      isSyntaxError: false,
      results: [
        {
          blockId: 'block-2',
          statementIndex: 0,
          valueType: Type.Number,
          value: 2,
        },
        {
          blockId: 'block-2',
          statementIndex: 1,
          valueType: Type.Number,
          value: 2,
        },
      ],
    },
  ]);
});

it('returns type errors', async () => {
  expect(
    (await testCompute(programContainingError, 'block-0'))[0].results[1]
      .valueType.errorCause
  ).toBeInstanceOf(InferError);
});

it('ignores errors in non-target, non-dependent code', async () => {
  expect(
    (await testCompute(programContainingError, 'block-0'))[0].results[1]
      .typeErrorCause
  ).toBeUndefined();
});

it('honours cache', async () => {
  // Fill in cache
  await computeOnTestComputer(unparsedProgram, ['block-D']);

  // Nothing is new
  expect(await computeOnTestComputer(unparsedProgram, ['block-D'])).toEqual({
    type: 'compute-response',
    updates: [],
  });

  // Change C
  const changedC = produce(unparsedProgram, (program) => {
    program[1].source = 'C = B + 10.1';
  });
  expect(await computeOnTestComputer(changedC, ['block-D'])).toMatchObject({
    type: 'compute-response',
    updates: [
      {
        blockId: 'block-C',
        results: [
          {
            statementIndex: 0,
          },
        ],
      },
      {
        blockId: 'block-D',
        results: [
          {
            statementIndex: 0,
          },
        ],
      },
    ],
  });

  // Break it by removing B
  const broken = produce(unparsedProgram, (program) => {
    program[0].source = 'A = 0.5';
  });
  expect(await computeOnTestComputer(broken, ['block-D'])).toMatchObject({
    type: 'compute-response',
    updates: [
      {
        blockId: 'block-C',
        results: [
          {
            statementIndex: 0,
            value: null, // error
          },
        ],
      },
      {
        blockId: 'block-D',
        results: [
          {
            statementIndex: 0,
            value: null, // error
          },
        ],
      },
    ],
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
      source: ['A = 1', '', '', 'B = 2', 'C = 3'].join('\n'),
    },
  ]);

  const locOf = (loc) => computer.cursorPosToValueLocation(loc);

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
