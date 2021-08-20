import { Time } from '..';
import {
  cleanDate,
  getDateFromAstForm,
  parseUTCDate,
  stringifyDate,
  getSpecificity,
  sortSpecificities,
  sortTimeUnits,
  arrayToDate,
} from './index';

const d = parseUTCDate;

it('can turn any kind of time unit into date specificities', () => {
  expect(getSpecificity('time')).toEqual('time');
  expect(getSpecificity('quarter')).toEqual('month');
  expect(getSpecificity('week')).toEqual('day');

  expect(() => getSpecificity('nonsense' as Time.Unit)).toThrow();
});

it('can sort specificities', () => {
  expect(sortSpecificities(['time', 'month', 'day'])).toEqual([
    'month',
    'day',
    'time',
  ]);

  expect(
    sortSpecificities(['time', 'month', 'quarter', 'day', 'week', 'second'])
  ).toEqual(['month', 'day', 'time']);
});

it('can sort time units', () => {
  expect(sortTimeUnits(['minute', 'month', 'day'])).toEqual([
    'month',
    'day',
    'minute',
  ]);
});

it('can parse a date from an array of elements', () => {
  expect(arrayToDate(['2020', 1, 10, /* T */ 11, 30, 13, 123])).toEqual(
    Date.UTC(2020, 0, 10, 11, 30, 13, 123)
  );

  expect(arrayToDate(['2020', 5, 10, /* T */ 11, 30, 13, 123])).toEqual(
    Date.UTC(2020, 4, 10, 11, 30, 13, 123)
  );

  expect(arrayToDate(['2020'])).toEqual(Date.UTC(2020, 0));

  expect(arrayToDate([2020])).toEqual(Date.UTC(2020, 0));

  expect(arrayToDate([2020, '01'])).toEqual(Date.UTC(2020, 0));
});

it('can parse a date', () => {
  expect(parseUTCDate('2020-01-01')).toEqual(Date.UTC(2020, 0, 1));
});

it('can stringify a date', () => {
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'year')).toEqual('2020');
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'day')).toEqual(
    '2020-10-21'
  );
  expect(stringifyDate(parseUTCDate('2020-01-10T10:30'), 'month')).toEqual(
    '2020-01'
  );
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'time')).toEqual(
    '2020-10-21 00:00'
  );
  expect(stringifyDate(parseUTCDate('2020-10-21T10:30'), 'time')).toEqual(
    '2020-10-21 10:30'
  );
});

it('can round a date into a range', () => {
  expect(cleanDate(d('2020-01-15'), 'year')).toEqual(d('2020'));
  expect(cleanDate(d('2020-01-15'), 'month')).toEqual(d('2020-01'));
  expect(cleanDate(d('2020-05-05T10:00Z'), 'day')).toEqual(d('2020-05-05'));
});

it('does not round times', () => {
  const date = d('2020-05-05T10:00:00.004Z');
  expect(!Number.isNaN(date)).toEqual(true);
  expect(cleanDate(date, 'time')).toEqual(date);
});

it("gets a date from an AST date's arguments", () => {
  expect(getDateFromAstForm(['year', 2020])).toEqual([d('2020-01-01'), 'year']);

  expect(getDateFromAstForm(['year', 2020, 'month', 3])).toEqual([
    d('2020-03-01'),
    'month',
  ]);

  expect(
    getDateFromAstForm(['year', 2020, 'month', 3, 'day', 10, 'hour', 10])
  ).toEqual([d('2020-03-10T10:00:00'), 'time']);

  expect(
    getDateFromAstForm([
      'year',
      2020,
      'month',
      3,
      'day',
      10,
      'hour',
      10,
      'minute',
      30,
      'second',
      10,
    ])
  ).toEqual([d('2020-03-10T10:30:10'), 'time']);
});
