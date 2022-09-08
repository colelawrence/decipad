import { parseDate } from './parseDate';
import { DateGranularity } from './types';

describe('dates', () => {
  it.each([
    ['2020', { kind: 'date', date: 'year' }, '2020-01-01T00:00'],
    ['22', { kind: 'date', date: 'year' }, '2022-01-01T00:00:00'],
    ['2020-10', { kind: 'date', date: 'month' }, '2020-10-01T00:00'],
    ['12/2020', { kind: 'date', date: 'month' }, '2020-12-01T00:00'],
    ['13/10/2020', { kind: 'date', date: 'day' }, '2020-10-13T00:00'],
    ['14-10-2020', { kind: 'date', date: 'day' }, '2020-10-14T00:00'],
    ['2020-10-13', { kind: 'date', date: 'day' }, '2020-10-13T00:00'],
    ['2020/10/13', { kind: 'date', date: 'day' }, '2020-10-13T00:00'],
    ['2020/10/13 10:30', { kind: 'date', date: 'minute' }, '2020-10-13T10:30'],
    ['2020-10-13 1:30', { kind: 'date', date: 'minute' }, '2020-10-13T01:30'],
  ])('%s is a good %s', (format, type, result) => {
    const d = parseDate(format, type.date as DateGranularity);
    expect(d).toBeDefined();
    expect(d?.date).toEqual(new Date(result));
  });

  it.each([
    ['20201', { kind: 'date', date: 'year' }],
    ['13/2020', { kind: 'date', date: 'month' }],
    ['2020/13', { kind: 'date', date: 'month' }],
    ['32/10/2020', { kind: 'date', date: 'month' }],
    ['32/10/2020', { kind: 'date', date: 'day' }],
    ['10/13/2020 10:30', { kind: 'date', date: 'day' }],
    ['10/13/2020', { kind: 'date', date: 'minute' }],
  ])('%s is not a %s', (format, type) => {
    expect(parseDate(format, type.date as DateGranularity)).toEqual(undefined);
  });
});
