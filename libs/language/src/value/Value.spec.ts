import { F } from '../utils';
import { parseUTCDate } from '../date';
import { jsCol } from '../lazy/testUtils';
import {
  Scalar,
  Column,
  Range,
  DateValue,
  fromJS,
  FilteredColumn,
  MappedColumn,
} from '.';
import { getLabelIndex } from '../dimtools';

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
  const date = DateValue.fromDateAndSpecificity(d('2020-01-04'), 'month');
  expect(date.getData()).toEqual(d('2020-01'));
});

it('can represent a column of dates', () => {
  const dates = Column.fromValues([
    DateValue.fromDateAndSpecificity(d('2021-02-15'), 'month'),
    DateValue.fromDateAndSpecificity(d('2021-06-15'), 'month'),
  ]);

  expect(dates.getData()).toEqual([d('2021-02'), d('2021-06')]);
});

it('Can retrieve the original index in a filtered column', () => {
  const values = jsCol([1, 2, 3]);
  const doNothingFilter = new FilteredColumn(values, [true, true, true]);
  expect(getLabelIndex(doNothingFilter, 1)).toEqual(1);

  const firstTakenOff = new FilteredColumn(values, [false, true, true]);
  expect(getLabelIndex(firstTakenOff, 0)).toEqual(1);
  expect(getLabelIndex(firstTakenOff, 1)).toEqual(2);
  expect(() => getLabelIndex(firstTakenOff, 2)).toThrow();
});

it('Can retrieve the original index in a doubly filtered column', () => {
  const values = jsCol([1, 2, 3]);
  const firstTakenOff = new FilteredColumn(values, [false, true, true]);
  const lastTakenOff = new FilteredColumn(firstTakenOff, [true, false]);

  expect(getLabelIndex(lastTakenOff, 0)).toEqual(1);
  expect(() => getLabelIndex(lastTakenOff, 1)).toThrow(/index not found/);
});

it('Can retrieve the original index in a mapped column', () => {
  const values = jsCol([1, 2, 3]);

  const reversed = new MappedColumn(values, [2, 1, 0]);
  expect(getLabelIndex(reversed, 0)).toEqual(2);
  expect(getLabelIndex(reversed, 2)).toEqual(0);
});
