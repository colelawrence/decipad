import { zip } from '@decipad/utils';
import { buildType as t } from '..';
import { stringifyResult } from '../result';
import { fromJS, Column } from '../interpreter/Value';
import {
  getCardinality,
  heightenValueDimensionsIfNecessary,
  heightenDimensionsIfNecessary,
} from './common';

it('can get cardinality', () => {
  expect(getCardinality(t.number())).toEqual(1);

  expect(getCardinality(t.column(t.column(t.number(), 2), 2))).toEqual(3);

  expect(getCardinality(t.column(t.column(t.date('month'), 9), 9))).toEqual(3);

  expect(getCardinality(t.column(t.column(t.range(t.number()), 9), 9))).toEqual(
    3
  );

  expect(
    getCardinality(t.row([t.number(), t.column(t.number(), 6)], ['A', 'B']))
  ).toEqual(1);

  expect(
    getCardinality(
      t.table({
        length: 123,
        columnNames: ['A', 'B'],
        columnTypes: [t.number(), t.column(t.number(), 6)],
      })
    )
  ).toEqual(1);
});

describe('heightenValueDimensionsIfNecessary', () => {
  const testNecessary = (
    ...args: Parameters<typeof heightenValueDimensionsIfNecessary>
  ) => {
    const [type, value] = heightenValueDimensionsIfNecessary(...args);

    return zip(type, value).map(([type, value]) =>
      stringifyResult(value.getData(), type, (x) => x)
    );
  };

  it('can heightenValueDimensionsIfNecessary', () => {
    expect(testNecessary([t.number()], [fromJS(1)], [2]))
      .toMatchInlineSnapshot(`
      Array [
        "[ 1 ]",
      ]
    `);
  });

  it('base case (do ñothing)', () => {
    expect(testNecessary([t.column(t.number(), 1)], [fromJS([1])], [2]))
      .toMatchInlineSnapshot(`
        Array [
          "[ 1 ]",
        ]
      `);
    expect(
      testNecessary(
        [t.column(t.column(t.number(), 1), 2)],
        [Column.fromValues([Column.fromValues([fromJS(1)])])],
        [2]
      )
    ).toMatchInlineSnapshot(`
      Array [
        "[ [ 1 ] ]",
      ]
    `);
  });

  it.todo('errors with mismatched dimensions in arguments');
});

describe('heightenDimensionsIfNecessary', () => {
  const testNecessary = (
    ...args: Parameters<typeof heightenDimensionsIfNecessary>
  ) => {
    const types = heightenDimensionsIfNecessary(...args);

    return types.map((type) => type.toString());
  };

  it('can heightenValueDimensionsIfNecessary', () => {
    expect(testNecessary([t.number()], [2])).toMatchInlineSnapshot(`
      Array [
        "<number> x 1",
      ]
    `);
  });

  it('base case (do ñothing)', () => {
    expect(testNecessary([t.column(t.number(), 1)], [2]))
      .toMatchInlineSnapshot(`
      Array [
        "<number> x 1",
      ]
    `);
    expect(testNecessary([t.column(t.column(t.number(), 1), 2)], [2]))
      .toMatchInlineSnapshot(`
      Array [
        "<number> x 1 x 2",
      ]
    `);
  });

  it.todo('errors with mismatched dimensions in arguments');
});
