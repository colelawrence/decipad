import { TimeUnit } from './Time';
import { arrayToDate } from './arrayToDate';
import { cleanDate } from './cleanDate';
import { sortSpecificities } from './getHighestSpecificity';
import { getSpecificity } from './getSpecificity';
import { parseUTCDate } from './parseUTCDate';

const d = parseUTCDate;

it('can turn any kind of time unit into date specificities', () => {
  expect(getSpecificity('second')).toEqual('second');
  expect(getSpecificity('quarter')).toEqual('quarter');
  expect(getSpecificity('decade')).toEqual('year');
  expect(getSpecificity('week')).toEqual('day');

  expect(() => getSpecificity('nonsense' as TimeUnit)).toThrow();
});

it('can sort specificities', () => {
  expect(
    sortSpecificities(['second', 'month', 'hour', 'day', 'quarter'])
  ).toEqual(['quarter', 'month', 'day', 'hour', 'second']);

  expect(
    sortSpecificities(['second', 'month', 'quarter', 'day', 'week', 'second'])
  ).toEqual(['quarter', 'month', 'day', 'second']);
});

it('can parse a date from an array of elements', () => {
  expect(arrayToDate(['2020', 1n, 10n, /* T */ 11n, 30n, 13n, 123n])).toEqual(
    BigInt(Date.UTC(2020, 0, 10, 11, 30, 13, 123))
  );

  expect(arrayToDate(['2020', 5n, 10n, /* T */ 11n, 30n, 13n, 123n])).toEqual(
    BigInt(Date.UTC(2020, 4, 10, 11, 30, 13, 123))
  );

  expect(arrayToDate(['2020'])).toEqual(BigInt(Date.UTC(2020, 0)));

  expect(arrayToDate([2020n])).toEqual(BigInt(Date.UTC(2020, 0)));

  expect(arrayToDate([2020n, '01'])).toEqual(BigInt(Date.UTC(2020, 0)));
});

it('can round a date into a range', () => {
  expect(cleanDate(d('2020-01-15'), 'year')).toEqual(d('2020'));
  expect(cleanDate(d('2020-01-15'), 'month')).toEqual(d('2020-01'));
  expect(cleanDate(d('2020-05-05T10:00Z'), 'day')).toEqual(d('2020-05-05'));
});

it('does not round times', () => {
  const date = d('2020-05-05T10:00:00.004Z');
  expect(!Number.isNaN(date)).toEqual(true);
  expect(cleanDate(date, 'millisecond')).toEqual(date);
});
