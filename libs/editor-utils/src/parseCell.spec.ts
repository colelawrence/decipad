import { TableCellType } from '@decipad/editor-types';
import { prettyPrintAST } from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { parseCell, parseDate } from './parseCell';

type ValidateTest = [string, TableCellType, string];
type NoValidateTest = [string, TableCellType];

const testParseCell = (type: TableCellType, text: string) =>
  prettyPrintAST(getDefined(parseCell(type, text)));

it('turns cells into AST nodes', () => {
  expect(
    testParseCell({ kind: 'number', unit: null }, '123')
  ).toMatchInlineSnapshot(`"123"`);
  expect(
    testParseCell(
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              exp: { n: 1n, d: 1n, s: 1n },
              known: false,
              multiplier: { n: 1n, d: 1n, s: 1n },
              unit: 'bananas',
            },

            {
              exp: { n: 2n, d: 1n, s: -1n },
              known: true,
              multiplier: { n: 1000n, d: 1n, s: 1n },
              unit: 'm',
            },
          ],
        },
      },

      '123'
    )
  ).toMatchInlineSnapshot(`"(* 123 (* (ref banana) (^ (ref km) -2)))"`);
  expect(
    testParseCell(
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              exp: { n: 1n, d: 1n, s: 1n },
              known: true,
              multiplier: { n: 1n, d: 1n, s: 1n },
              unit: 'm',
            },

            {
              exp: { n: 1n, d: 1n, s: 1n },
              known: true,
              multiplier: { n: 1n, d: 1n, s: 1n },
              unit: 's',
            },
          ],
        },
      },

      '123'
    )
  ).toMatchInlineSnapshot(`"(* 123 (* (ref m) (ref s)))"`);
  expect(testParseCell({ kind: 'string' }, '123')).toMatchInlineSnapshot(
    `"\\"123\\""`
  );
  expect(
    testParseCell({ kind: 'date', date: 'year' }, '2021')
  ).toMatchInlineSnapshot(`"(date year 2021)"`);
  expect(
    testParseCell({ kind: 'date', date: 'day' }, '2021-12-13')
  ).toMatchInlineSnapshot(`"(date year 2021 month 12 day 13)"`);
  expect(
    testParseCell({ kind: 'date', date: 'minute' }, '2021-12-13 10:30')
  ).toMatchInlineSnapshot(
    `"(date year 2021 month 12 day 13 hour 10 minute 30)"`
  );
});

it.each([
  ['abc', { kind: 'number', unit: null }],
  ['3a', { kind: 'number', unit: null }],
  ['99999', { kind: 'date', date: 'year' }],
  ['aaaa', { kind: 'date', date: 'year' }],
] as NoValidateTest[])('%s is not a valid %s', (format, type) => {
  expect(parseCell(type, format)).toEqual(null);
});

describe('dates', () => {
  it.each([
    ['2020', { kind: 'date', date: 'year' }, '2020-01-01'],
    ['20', { kind: 'date', date: 'year' }, '2020-01-01'],
    ['2020-10', { kind: 'date', date: 'month' }, '2020-10-01'],
    ['12/2020', { kind: 'date', date: 'month' }, '2020-12-01'],
    ['13/10/2020', { kind: 'date', date: 'day' }, '2020-10-13'],
    ['14-10-2020', { kind: 'date', date: 'day' }, '2020-10-14'],
    ['2020-10-13', { kind: 'date', date: 'day' }, '2020-10-13'],
    ['2020/10/13', { kind: 'date', date: 'day' }, '2020-10-13'],
    ['2020/10/13 10:30', { kind: 'date', date: 'minute' }, '2020-10-13T10:30Z'],
    ['2020-10-13 1:30', { kind: 'date', date: 'minute' }, '2020-10-13T01:30Z'],
    [
      '2020/10/13 1:30 AM',
      { kind: 'date', date: 'minute' },
      '2020-10-13T01:30Z',
    ],
  ] as ValidateTest[])('%s is a good %s', (format, type, result) => {
    expect(parseDate(type, format)).toEqual(new Date(result));
  });

  it.each([
    ['20201', { kind: 'date', date: 'year' }],
    ['13/2020', { kind: 'date', date: 'month' }],
    ['2020/13', { kind: 'date', date: 'month' }],
    ['32/10/2020', { kind: 'date', date: 'month' }],
    ['32/10/2020', { kind: 'date', date: 'day' }],
    ['10/13/2020', { kind: 'date', date: 'day' }],
    ['10/13/2020 10:30', { kind: 'date', date: 'day' }],
    ['10/13/2020', { kind: 'date', date: 'minute' }],
  ] as NoValidateTest[])('%s is not a %s', (format, type) => {
    expect(parseDate(type, format)).toEqual(null);
  });
});
