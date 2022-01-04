import { F } from '../utils';
import { parseUTCDate } from '../date';
import { Scalar, Column, Range, Date, fromJS } from './Value';

it('can get from JS for testing', () => {
  expect(fromJS(1)).toEqual(Scalar.fromValue(1));
  expect(fromJS([1, 2, 3])).toEqual(
    Column.fromValues([
      Scalar.fromValue(1),
      Scalar.fromValue(2),
      Scalar.fromValue(3),
    ])
  );
});

it('can represent a range', () => {
  expect(
    Range.fromBounds(Scalar.fromValue(0), Scalar.fromValue(10)).getData()
  ).toEqual([F(0), F(10)]);

  const r = Range.fromBounds(fromJS(0), fromJS(10));
  expect(() => Range.fromBounds(r, r).getData()).toThrow();
});

const d = parseUTCDate;

it('can represent a date', () => {
  const date = Date.fromDateAndSpecificity(d('2020-01-04'), 'month');
  expect(date.getData()).toEqual(d('2020-01'));
});

it('can represent a column of dates', () => {
  const dates = Column.fromValues([
    Date.fromDateAndSpecificity(d('2021-02-15'), 'month'),
    Date.fromDateAndSpecificity(d('2021-06-15'), 'month'),
  ]);

  expect(dates.getData()).toEqual([d('2021-02'), d('2021-06')]);
});
