import { getDependents } from './dependents';
import { deeperProgram, implicitDepProgram } from '../testUtils';

describe('getDependents', () => {
  it('finds dependents of a set of locs', () => {
    expect(getDependents(deeperProgram, ['block-0'])).toMatchInlineSnapshot(`
        Array [
          "block-0",
          "block-3",
          "block-4",
        ]
      `);

    expect(getDependents(deeperProgram, ['block-2'])).toMatchInlineSnapshot(`
        Array [
          "block-2",
          "block-4",
          "block-5",
          "block-6",
        ]
      `);
  });

  it('additionally finds symbols which are passed in', () => {
    expect(getDependents(deeperProgram, ['block-0'], new Set(['var:Unused'])))
      .toMatchInlineSnapshot(`
      Array [
        "block-0",
        "block-1",
        "block-3",
        "block-4",
      ]
    `);
  });

  it('finds implicit previous dependencies', () => {
    expect(getDependents(implicitDepProgram, ['block-1']))
      .toMatchInlineSnapshot(`
        Array [
          "block-1",
          "block-3",
          "block-4",
          "block-5",
          "block-6",
        ]
      `);
  });
});
