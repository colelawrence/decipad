import {
  cleanDate,
  getDateFromAstForm,
  parseUTCDate,
  stringifyDate,
  arrayToDate,
} from './index';

const d = parseUTCDate;

it('can parse a date from an array of elements', () => {
  expect(arrayToDate(['2020', 1, 10, /*T*/ 11, 30, 13, 123])).toEqual([
    Date.UTC(2020, 0, 10, 11, 30, 13, 123),
    'time',
  ]);

  expect(arrayToDate(['2020', 5, 10, /*T*/ 11, 30, 13, 123])).toEqual([
    Date.UTC(2020, 4, 10, 11, 30, 13, 123),
    'time',
  ]);

  expect(arrayToDate(['2020'])).toEqual([Date.UTC(2020, 0), 'year']);

  expect(arrayToDate([2020])).toEqual([Date.UTC(2020, 0), 'year']);

  expect(arrayToDate([2020, '01'])).toEqual([Date.UTC(2020, 0), 'month']);
});

it('can parse a date', () => {
  expect(parseUTCDate('2020-01-01')).toEqual(Date.UTC(2020, 0, 1));
});

it('can stringify a date', () => {
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'year')).toEqual('2020')
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'day')).toEqual('2020-10-21')
  expect(stringifyDate(parseUTCDate('2020-10-21'), 'time')).toEqual('2020-10-21 00:00')
  expect(stringifyDate(parseUTCDate('2020-10-21T10:30'), 'time')).toEqual('2020-10-21 10:30')
})

it('can round a date into a range', () => {
  expect(cleanDate(d('2020-01-15'), 'year')).toEqual([
    d('2020'),
    d('2021') - 1,
  ]);

  expect(cleanDate(d('2020-01-15'), 'month')).toEqual([
    d('2020-01'),
    d('2020-02') - 1,
  ]);

  expect(cleanDate(d('2020-05-05T10:00Z'), 'day')).toEqual([
    d('2020-05-05'),
    d('2020-05-06') - 1,
  ]);
});

it('does not round times', () => {
  const date = d('2020-05-05T10:00:00.004Z');
  expect(!isNaN(date)).toEqual(true);
  expect(cleanDate(date, 'time')).toEqual([date, date]);
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
