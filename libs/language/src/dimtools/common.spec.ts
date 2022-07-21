import { buildType as t } from '..';
import { getCardinality } from './common';

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
