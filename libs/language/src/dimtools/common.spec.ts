import { buildType as t } from '..';
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
  it('can heightenValueDimensionsIfNecessary', () => {
    expect(
      heightenValueDimensionsIfNecessary([t.number()], [fromJS(1)], [2])
    ).toMatchObject([
      [{ cellType: { type: 'number' }, columnSize: 1 }],
      [new Column([fromJS(1)])],
    ]);
  });

  it('base case (do ñothing)', () => {
    expect(
      heightenValueDimensionsIfNecessary(
        [t.column(t.number(), 1)],
        [fromJS([1])],
        [2]
      )
    ).toMatchObject([
      [{ cellType: { type: 'number' }, columnSize: 1 }],
      [new Column([fromJS(1)])],
    ]);
    expect(
      heightenValueDimensionsIfNecessary(
        [t.column(t.column(t.number(), 1), 2)],
        [Column.fromValues([Column.fromValues([fromJS(1)])])],
        [2]
      )
    ).toMatchObject([
      [{ cellType: { type: null }, columnSize: 2 }],
      [new Column([new Column([fromJS(1)])])],
    ]);
  });

  it.todo('errors with mismatched dimensions in arguments');
});

describe('heightenDimensionsIfNecessary', () => {
  it('can heightenValueDimensionsIfNecessary', () => {
    expect(heightenDimensionsIfNecessary([t.number()], [2])).toMatchObject([
      {
        columnSize: 1,
        cellType: {
          type: 'number',
        },
      },
    ]);
  });

  it('base case (do ñothing)', () => {
    expect(
      heightenDimensionsIfNecessary([t.column(t.number(), 1)], [2])
    ).toMatchObject([
      {
        columnSize: 1,
        cellType: {
          type: 'number',
        },
      },
    ]);
    expect(
      heightenDimensionsIfNecessary([t.column(t.column(t.number(), 1), 2)], [2])
    ).toMatchObject([
      {
        columnSize: 2,
        cellType: {
          cellType: {
            type: 'number',
          },
        },
      },
    ]);
  });

  it.todo('errors with mismatched dimensions in arguments');
});
