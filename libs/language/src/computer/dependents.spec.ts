import { getDependents } from './dependents';
import { deeperProgram } from './testutils';

describe('getDependents', () => {
  it('finds dependents of a set of locs', () => {
    expect(getDependents(deeperProgram, [['block-0', 0]])).toEqual([
      ['block-0', 0],
      ['block-1', 1],
      ['block-1', 2],
    ]);

    expect(getDependents(deeperProgram, [['block-1', 0]])).toEqual([
      ['block-1', 0],
      ['block-1', 2],
      ['block-2', 0],
      ['block-2', 1],
    ]);
  });

  it('additionally finds symbols which are passed in', () => {
    expect(
      getDependents(deeperProgram, [['block-0', 0]], new Set(['var:Unused']))
    ).toEqual([
      ['block-0', 0],
      ['block-0', 1],
      ['block-1', 1],
      ['block-1', 2],
    ]);
  });
});
