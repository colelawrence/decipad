import { Time } from '..';
import {
  cleanDate,
  getDateFromAstForm,
  parseUTCDate,
  stringifyDate,
  addTimeQuantity,
  getSpecificity,
  sortSpecificities,
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

describe('time quantities', () => {
  it('can add time quantities to a date', () => {
    expect(addTimeQuantity(parseUTCDate('2020-01-01'), [['day', 10]])).toEqual(
      parseUTCDate('2020-01-11')
    );

    expect(
      addTimeQuantity(parseUTCDate('2020-01-01'), [
        ['minute', 10],
        ['second', 1],
      ])
    ).toEqual(parseUTCDate('2020-01-01T00:10:01'));

    // Rolling over powered by the JS Date API
    expect(
      addTimeQuantity(parseUTCDate('2020-01-01'), [['second', 69]])
    ).toEqual(parseUTCDate('2020-01-01T00:01:09'));
  });

  it('can add composite quantities', () => {
    expect(addTimeQuantity(parseUTCDate('2020-01-01'), [['year', 1]])).toEqual(
      parseUTCDate('2021-01-01')
    );

    expect(
      addTimeQuantity(parseUTCDate('2020-01-01'), [['quarter', 1]])
    ).toEqual(parseUTCDate('2020-04-01'));
  });

  it("rounds down the day if it's over the end of a month", () => {
    // February is a good example
    expect(addTimeQuantity(parseUTCDate('2020-01-31'), [['month', 1]])).toEqual(
      parseUTCDate('2020-02-29')
    );
    expect(addTimeQuantity(parseUTCDate('2021-01-31'), [['month', 1]])).toEqual(
      parseUTCDate('2021-02-28')
    );

    // Same thing but with DST -- we use Date.UTC but just in case
    expect(addTimeQuantity(parseUTCDate('2020-05-31'), [['month', 1]])).toEqual(
      parseUTCDate('2020-06-30')
    );

    // How about an entire year?
    expect(addTimeQuantity(parseUTCDate('2020-02-29'), [['year', 1]])).toEqual(
      parseUTCDate('2021-02-28')
    );
  });
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
  expect(!Number.isNaN(date)).toEqual(true);
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
