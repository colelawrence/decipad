import { getDependents } from './dependents';
import { deeperProgram, implicitDepProgram, testBlocks } from '../testUtils';

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
    expect(getDependents(deeperProgram, ['block-0'], new Set(['Unused'])))
      .toMatchInlineSnapshot(`
        Array [
          "block-0",
          "block-1",
          "block-3",
          "block-4",
        ]
      `);
  });

  it('marks definitions of tables when any of their columns is involved', () => {
    expect(
      getDependents(
        testBlocks(
          'Table = {}',
          'Table.Column = 1',
          'Table2 = {}',
          'Table2.Column = Table.Column'
        ),

        ['block-1'],
        new Set(['Unused'])
      )
    ).toMatchInlineSnapshot(`
      Array [
        "block-0",
        "block-1",
        "block-2",
        "block-3",
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
