import { F } from '@decipad/fraction';
import { TableCellType } from '@decipad/editor-types';
import { Computer, prettyPrintAST } from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { getExpression, parseCell } from './parseCell';

type NoValidateTest = [string, TableCellType];

const testParseCell = async (type: TableCellType, text: string) =>
  prettyPrintAST(
    getExpression(getDefined(await parseCell(new Computer(), type, text)))
  );

it('turns cells into AST nodes', async () => {
  expect(
    await testParseCell({ kind: 'number', unit: null }, '123')
  ).toMatchInlineSnapshot(`"123"`);
  expect(
    await testParseCell(
      {
        kind: 'number',
        unit: [
          {
            exp: F(1),
            known: false,
            multiplier: F(1),
            unit: 'bananas',
          },
          {
            exp: F(-2),
            known: true,
            multiplier: F(1000),
            unit: 'm',
          },
        ],
      },

      '123'
    )
  ).toMatchInlineSnapshot(
    `"(implicit* 123 (* (ref bananas) (^ (ref km) -2)))"`
  );

  expect(
    await testParseCell(
      {
        kind: 'number',
        unit: [
          {
            exp: F(1),
            known: true,
            multiplier: F(1),
            unit: 'm',
          },
          {
            exp: F(1),
            known: true,
            multiplier: F(1),
            unit: 's',
          },
        ],
      },

      '123'
    )
  ).toMatchInlineSnapshot(`"(implicit* 123 (* (ref m) (ref s)))"`);
  expect(await testParseCell({ kind: 'string' }, '123')).toMatchInlineSnapshot(
    `"\\"123\\""`
  );
  expect(
    await testParseCell({ kind: 'date', date: 'year' }, '2021')
  ).toMatchInlineSnapshot(`"(date year 2021)"`);
  expect(
    await testParseCell({ kind: 'date', date: 'day' }, '2021-12-13')
  ).toMatchInlineSnapshot(`"(date year 2021 month 12 day 13)"`);
  expect(
    await testParseCell({ kind: 'date', date: 'minute' }, '2021-12-13 10:30')
  ).toMatchInlineSnapshot(
    `"(date year 2021 month 12 day 13 hour 10 minute 30)"`
  );
  expect(
    await testParseCell({ kind: 'number', unit: null }, '30%')
  ).toMatchInlineSnapshot(`"0.3"`);
});

it.each([
  ['abc', { kind: 'number', unit: null }],
  ['3a', { kind: 'number', unit: null }],
  ['99999', { kind: 'date', date: 'year' }],
  ['aaaa', { kind: 'date', date: 'year' }],
] as NoValidateTest[])('%s is not a valid %s', async (format, type) => {
  expect(await parseCell(new Computer(), type, format)).toBeInstanceOf(Error);
});
