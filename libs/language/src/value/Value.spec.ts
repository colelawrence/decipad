import { N } from '@decipad/number';
import { all } from '@decipad/generator-utils';
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
import { materializeOneResult } from '../utils/materializeOneResult';

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

it('can represent a range', async () => {
  expect(
    await (
      await Range.fromBounds(Scalar.fromValue(0), Scalar.fromValue(10))
    ).getData()
  ).toEqual([N(0), N(10)]);

  const r = await Range.fromBounds(fromJS(0), fromJS(10));
  await expect(async () => Range.fromBounds(r, r)).rejects.toThrow();
});

const d = parseUTCDate;

it('can represent a date', async () => {
  const date = DateValue.fromDateAndSpecificity(d('2020-01-04'), 'month');
  expect(await date.getData()).toEqual(d('2020-01'));
});

it('can represent a column of dates', async () => {
  const dates = Column.fromValues([
    DateValue.fromDateAndSpecificity(d('2021-02-15'), 'month'),
    DateValue.fromDateAndSpecificity(d('2021-06-15'), 'month'),
  ]);

  expect(await materializeOneResult(await dates.getData())).toEqual([
    d('2021-02'),
    d('2021-06'),
  ]);
});

it('Can retrieve the original index in a filtered column', async () => {
  const values = jsCol([1, 2, 3]);
  const doNothingFilter = new FilteredColumn(values, [true, true, true]);
  expect(await getLabelIndex(doNothingFilter, 1)).toEqual(1);

  const firstTakenOff = new FilteredColumn(values, [false, true, true]);
  expect(await getLabelIndex(firstTakenOff, 0)).toEqual(1);
  expect(await getLabelIndex(firstTakenOff, 1)).toEqual(2);
  await expect(async () => getLabelIndex(firstTakenOff, 2)).rejects.toThrow();
});

it('Can retrieve the original index in a doubly filtered column', async () => {
  const values = jsCol([1, 2, 3]);
  const firstTakenOff = new FilteredColumn(values, [false, true, true]);
  const lastTakenOff = new FilteredColumn(firstTakenOff, [true, false]);

  expect(await getLabelIndex(lastTakenOff, 0)).toEqual(1);
  await expect(async () => getLabelIndex(lastTakenOff, 1)).rejects.toThrow(
    /index not found/
  );
});

it('Can retrieve the original index in a mapped column', async () => {
  const values = jsCol([1, 2, 3]);

  const reversed = new MappedColumn(values, [2, 1, 0]);
  expect(await getLabelIndex(reversed, 0)).toEqual(2);
  expect(await getLabelIndex(reversed, 2)).toEqual(0);
});

it('can create column from generator', async () => {
  const col = Column.fromGenerator(async function* generate() {
    yield Scalar.fromValue(N(1));
    yield Scalar.fromValue(N(2));
    yield Scalar.fromValue(N(3));
  });
  expect(await all(col.values())).toEqual([
    Scalar.fromValue(N(1)),
    Scalar.fromValue(N(2)),
    Scalar.fromValue(N(3)),
  ]);
});
