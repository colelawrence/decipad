import { parseUTCDate } from '../date';
import { Scalar, Column, Range, Date as DateVal, fromJS } from './Value';

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

it('can be turned into a scalar value', () => {
  const oneNumber = Scalar.fromValue(1);
  const columnOfOne = fromJS([1]);
  const columnOfMany = fromJS([1, 2, 3]);

  expect(oneNumber.asScalar()).toEqual(oneNumber);
  expect(columnOfOne.asScalar()).toBeInstanceOf(Scalar);
  expect(columnOfOne.asScalar().getData()).toEqual(1);

  expect(() => columnOfMany.asScalar()).toThrow();
});

it('can be turned into something of the desired row count', () => {
  const oneNumber = fromJS(1);
  const column = fromJS([1, 2, 3]);

  expect(oneNumber.withRowCount(3).getData()).toEqual([1, 1, 1]);
  expect(column.withRowCount(3).getData()).toEqual([1, 2, 3]);
  expect(() => column.withRowCount(10)).toThrow(/panic:/);
});

it('can represent a range', () => {
  const range = Range.fromBounds(Scalar.fromValue(0), Scalar.fromValue(10));

  expect(range.getData()).toEqual([0, 10]);
});

const d = parseUTCDate;

it('can represent a date', () => {
  const date = DateVal.fromDateAndSpecificity(d('2020-01-04'), 'month');
  expect(date.getData()).toEqual([d('2020-01'), d('2020-02') - 1]);
});

it('can represent a column of dates', () => {
  const dates = Column.fromValues([
    DateVal.fromDateAndSpecificity(d('2021-02-15'), 'month'),
    DateVal.fromDateAndSpecificity(d('2021-06-15'), 'month'),
  ]);

  expect(dates.getData()).toEqual([
    [d('2021-02'), d('2021-03') - 1],
    [d('2021-06'), d('2021-07') - 1],
  ]);
});
