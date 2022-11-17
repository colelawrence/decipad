import { buildType as t } from '..';
import { chooseFirst, getCardinality, undoChooseFirst } from './common';

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
        columnNames: ['A', 'B'],
        columnTypes: [t.number(), t.column(t.number(), 6)],
      })
    )
  ).toEqual(1);
});

test.each([0, 1, 2, 3])(
  'chooseFirst(%d, [a,b,c,d]) is reversed with undoChooseFirst',
  (a) => {
    expect(undoChooseFirst(a, chooseFirst(a, ['a', 'b', 'c', 'd']))).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  }
);
