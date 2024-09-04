import { expect, it } from 'vitest';
import { N } from '@decipad/number';
import type { TableCellType } from '@decipad/editor-types';
// eslint-disable-next-line no-restricted-imports
import {
  getComputer,
  parseBlockOrThrow,
  prettyPrintAST,
} from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { getExpression, parseCell } from './parseCell';

type NoValidateTest = [string, TableCellType];

const testParseCell = async (
  type: TableCellType,
  text: string,
  computer = getComputer()
) =>
  prettyPrintAST(
    getExpression(getDefined(await parseCell(computer, type, text)))
  );

it('can parse cells with exprRefs', async () => {
  const computer = getComputer();
  await computer.pushComputeDelta({
    program: {
      upsert: [
        {
          type: 'identified-block',
          id: '1',
          block: parseBlockOrThrow('MyVarName = 5', '1'),
        },
      ],
    },
  });

  expect(
    await testParseCell({ kind: 'number', unit: null }, 'exprRef_1', computer)
  ).toMatchInlineSnapshot(`"(ref exprRef_1)"`);
});

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
            exp: N(1),
            known: false,
            multiplier: N(1),
            unit: 'bananas',
          },
          {
            exp: N(-2),
            known: true,
            multiplier: N(1000),
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
            exp: N(1),
            known: true,
            multiplier: N(1),
            unit: 'm',
          },
          {
            exp: N(1),
            known: true,
            multiplier: N(1),
            unit: 's',
          },
        ],
      },

      '123'
    )
  ).toMatchInlineSnapshot(`"(implicit* 123 (* (ref m) (ref s)))"`);

  expect(await testParseCell({ kind: 'string' }, '123')).toMatchInlineSnapshot(
    `""123""`
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
  ).toMatchInlineSnapshot(`"30%"`);
});

it('parses implicit and non implicit percentages the same', async () => {
  expect(
    await testParseCell(
      { kind: 'number', unit: null, numberFormat: 'percentage' },
      '30%'
    )
  ).toMatchInlineSnapshot(`"30%"`);
  expect(
    await testParseCell(
      { kind: 'number', unit: null, numberFormat: 'percentage' },
      '30'
    )
  ).toMatchInlineSnapshot(`"30%"`);
});

it.each([
  ['abc', { kind: 'number', unit: null }],
  ['3a', { kind: 'number', unit: null }],
  ['99999', { kind: 'date', date: 'year' }],
  ['aaaa', { kind: 'date', date: 'year' }],
  ['$100,000', { kind: 'number', unit: null }],
] as NoValidateTest[])('%s is not a valid %s', async (format, type) => {
  expect(await parseCell(getComputer(), type, format)).toBeInstanceOf(Error);
});
