import { TestComputationRealm } from './ComputationRealm';
import {
  getDependents,
  getEvaluationPlan,
  getDependencies,
} from './dependencies';
import { program, deeperProgram, programContainingReassign } from './testutils';

it('finds necessary pre-requisites for computing a key', () => {
  expect(getDependencies(program, [['block-0', 0]])).toEqual([['block-0', 0]]);

  expect(getDependencies(program, [['block-1', 1]])).toEqual([
    ['block-1', 1],
    ['block-0', 0],
  ]);

  expect(
    getDependencies(program, [
      ['block-1', 1],
      ['block-0', 1],
    ])
  ).toEqual([
    ['block-1', 1],
    ['block-0', 1],
    ['block-0', 0],
  ]);

  expect(
    getDependencies(program, [
      ['block-1', 1],
      ['block-1', 2],
    ])
  ).toEqual([
    ['block-1', 1],
    ['block-1', 2],
    ['block-0', 0],
    ['block-1', 0],
  ]);

  expect(getDependencies(deeperProgram, [['block-2', 1]])).toEqual([
    ['block-2', 1],
    ['block-2', 0],
    ['block-1', 0],
  ]);
});

it('finds a basic evaluation plan', () => {
  expect(
    getEvaluationPlan(program, ['block-0'], new TestComputationRealm([], []))
  ).toEqual([
    ['block-0', 0],
    ['block-0', 1],
  ]);
});

it('finds a basic evaluation plan while ignoring cached bits', () => {
  expect(
    getEvaluationPlan(
      program,
      ['block-0'],
      new TestComputationRealm(
        ['var:Unused', 'var:A'],
        [
          ['block-0', 0],
          ['block-0', 1],
        ]
      )
    )
  ).toEqual([]);
});

it('finds an evaluation plan', () => {
  expect(
    getEvaluationPlan(
      deeperProgram,
      ['block-2'],
      new TestComputationRealm([], [])
    )
  ).toEqual([
    ['block-1', 0],
    ['block-2', 0],
    ['block-2', 1],
  ]);
});

it('places dupe assignments together, to force them to confront each other', () => {
  expect(
    getEvaluationPlan(
      programContainingReassign,
      ['block-0', 'block-1'],
      new TestComputationRealm([], [])
    )
  ).toEqual([
    ['block-0', 0],
    ['block-1', 0],
  ]);

  expect(
    getEvaluationPlan(
      programContainingReassign,
      ['block-0', 'block-1'],
      new TestComputationRealm(['var:A'], [['block-0', 0]])
    )
  ).toEqual([
    ['block-0', 0],
    ['block-1', 0],
  ]);
});

it('skips cached stuff', () => {
  expect(
    getEvaluationPlan(
      program,
      ['block-0'],
      new TestComputationRealm(['var:Unused'], [['block-0', 1]])
    )
  ).toEqual([['block-0', 0]]);
});

describe('getDependents', () => {
  it('finds dependents of a set of blocks', () => {
    expect(getDependents(deeperProgram, ['block-0'])).toEqual([
      ['block-1', 1],
      ['block-1', 2],
    ]);

    expect(getDependents(deeperProgram, ['block-1'])).toEqual([
      ['block-2', 0],
      ['block-2', 1],
    ]);
  });
});
