import { it, expect } from 'vitest';
import {
  Time,
  getDateFromAstForm,
  getUTCDateSpecificity,
  sortTimeUnits,
} from './index';
import { parseUTCDate } from './testUtils';

const d = parseUTCDate;

it('can parse a date', () => {
  expect(parseUTCDate('2020')).toEqual(BigInt(Date.UTC(2020, 0, 1)));
  expect(parseUTCDate('2020-01-01')).toEqual(BigInt(Date.UTC(2020, 0, 1)));

  expect(getUTCDateSpecificity('2020')).toEqual('year');
  expect(getUTCDateSpecificity('2020-01-10')).toEqual('day');
  expect(getUTCDateSpecificity('2020-01-10T10')).toEqual('hour');
  expect(getUTCDateSpecificity('2020-01-10T10:30')).toEqual('minute');
});

it('can stringify a date', () => {
  expect(Time.stringifyDate(parseUTCDate('2020-10-21'), 'year')).toEqual(
    '2020'
  );
  expect(Time.stringifyDate(parseUTCDate('2020-10-21'), 'day')).toEqual(
    '2020-10-21'
  );
  expect(Time.stringifyDate(parseUTCDate('2020-01-10T10:30'), 'month')).toEqual(
    '2020-01'
  );
  expect(Time.stringifyDate(parseUTCDate('2020-10-21'), 'minute')).toEqual(
    '2020-10-21 00:00'
  );
  expect(
    Time.stringifyDate(parseUTCDate('2020-10-21T10:30'), 'millisecond')
  ).toEqual('2020-10-21 10:30');
});

it('can sort time units', () => {
  expect(sortTimeUnits(['minute', 'month', 'day', 'century'])).toEqual([
    'century',
    'month',
    'day',
    'minute',
  ]);
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
