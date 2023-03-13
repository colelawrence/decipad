import { Time } from '..';
import {
  cleanDate,
  getDateFromAstForm,
  getUTCDateSpecificity,
  parseUTCDate,
  stringifyDate,
  getSpecificity,
  sortSpecificities,
  sortTimeUnits,
  arrayToDate,
} from './index';

const d = parseUTCDate;

it('can turn any kind of time unit into date specificities', () => {
  expect(getSpecificity('second')).toEqual('second');
  expect(getSpecificity('quarter')).toEqual('quarter');
  expect(getSpecificity('decade')).toEqual('year');
  expect(getSpecificity('week')).toEqual('day');

  expect(() => getSpecificity('nonsense' as Time.Unit)).toThrow();
});

it('can sort specificities', () => {
  expect(
    sortSpecificities(['second', 'month', 'hour', 'day', 'quarter'])
  ).toEqual(['quarter', 'month', 'day', 'hour', 'second']);

  expect(
    sortSpecificities(['second', 'month', 'quarter', 'day', 'week', 'second'])
  ).toEqual(['quarter', 'month', 'day', 'second']);
});

it('can sort time units', () => {
  expect(sortTimeUnits(['minute', 'month', 'day', 'century'])).toEqual([
    'century',
    'month',
    'day',
    'minute',
  ]);
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

it('can parse a date', () => {
  expect(parseUTCDate('2020')).toEqual(BigInt(Date.UTC(2020, 0, 1)));
  expect(parseUTCDate('2020-01-01')).toEqual(BigInt(Date.UTC(2020, 0, 1)));

  expect(getUTCDateSpecificity('2020')).toEqual('year');
  expect(getUTCDateSpecificity('2020-01-10')).toEqual('day');
  expect(getUTCDateSpecificity('2020-01-10T10')).toEqual('hour');
  expect(getUTCDateSpecificity('2020-01-10T10:30')).toEqual('minute');
});

it('can stringify a date', () => {
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'year')).toEqual('2020');
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'day')).toEqual(
    '2020-10-21'
  );
  expect(stringifyDate(parseUTCDate('2020-01-10T10:30'), 'month')).toEqual(
    '2020-01'
  );
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'minute')).toEqual(
    '2020-10-21 00:00'
  );
  expect(
    stringifyDate(parseUTCDate('2020-10-21T10:30'), 'millisecond')
  ).toEqual('2020-10-21 10:30');
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

it("gets a date from an AST date's arguments", () => {
  expect(getDateFromAstForm(['year', 2020n])).toEqual([
    d('2020-01-01'),
    'year',
  ]);

  expect(getDateFromAstForm(['year', 2020n, 'month', 3n])).toEqual([
    d('2020-03-01'),
    'month',
  ]);

  expect(
    getDateFromAstForm(['year', 2020n, 'month', 3n, 'day', 10n, 'hour', 10n])
  ).toEqual([d('2020-03-10T10:00:00'), 'hour']);

  expect(
    getDateFromAstForm([
      'year',
      2020n,
      'month',
      3n,
      'day',
      10n,
      'hour',
      10n,
      'minute',
      30n,
      'second',
      10n,
    ])
  ).toEqual([d('2020-03-10T10:30:10'), 'second']);
});
