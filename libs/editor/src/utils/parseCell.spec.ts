import { prettyPrintAST } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { TableCellType } from './tableTypes';
import { parseCell, parseDate } from './parseCell';

type ValidateTest = [string, TableCellType, string];
type NoValidateTest = [string, TableCellType];

const testParseCell = (type: TableCellType, text: string) =>
  prettyPrintAST(getDefined(parseCell(type, text)));

it('turns cells into AST nodes', () => {
  expect(testParseCell('number', '123')).toMatchInlineSnapshot(`"123"`);
  expect(testParseCell('string', '123')).toMatchInlineSnapshot(`"\\"123\\""`);
  expect(testParseCell('date/year', '2021')).toMatchInlineSnapshot(
    `"(date year 2021)"`
  );
  expect(testParseCell('date/day', '2021-12-13')).toMatchInlineSnapshot(
    `"(date year 2021 month 12 day 13)"`
  );
  expect(testParseCell('date/time', '2021-12-13 10:30')).toMatchInlineSnapshot(
    `"(date year 2021 month 12 day 13 hour 10 minute 30)"`
  );
});

it.each([
  ['abc', 'number'],
  ['3a', 'number'],
  ['99999', 'date/year'],
  ['aaaa', 'date/year'],
] as NoValidateTest[])('%s is not a valid %s', (format, type) => {
  expect(parseCell(type, format)).toEqual(null);
});

describe('dates', () => {
  it.each([
    ['2020', 'date/year', '2020-01-01'],
    ['20', 'date/year', '2020-01-01'],
    ['2020-10', 'date/month', '2020-10-01'],
    ['12/2020', 'date/month', '2020-12-01'],
    ['13/10/2020', 'date/day', '2020-10-13'],
    ['14-10-2020', 'date/day', '2020-10-14'],
    ['2020-10-13', 'date/day', '2020-10-13'],
    ['2020/10/13', 'date/day', '2020-10-13'],
    ['2020/10/13 10:30', 'date/time', '2020-10-13T10:30'],
    ['2020-10-13 1:30', 'date/time', '2020-10-13T01:30'],
    ['2020/10/13 1:30 AM', 'date/time', '2020-10-13T01:30'],
  ] as ValidateTest[])('%s is a good %s', (format, type, result) => {
    expect(parseDate(type, format)).toEqual(new Date(result));
  });

  it.each([
    ['20201', 'date/year'],
    ['13/2020', 'date/month'],
    ['2020/13', 'date/month'],
    ['32/10/2020', 'date/month'],
    ['32/10/2020', 'date/day'],
    ['10/13/2020', 'date/day'],
    ['10/13/2020 10:30', 'date/day'],
    ['10/13/2020', 'date/time'],
  ] as NoValidateTest[])('%s is not a %s', (format, type) => {
    expect(parseDate(type, format)).toEqual(null);
  });
});
