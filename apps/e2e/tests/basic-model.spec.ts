import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp, ControlPlus } from '../utils/page/Editor';
import { createInputBelow, createSliderBelow } from 'apps/e2e/utils/page/Block';
import {
  addColumn,
  clickCell,
  createTable,
  focusOnTableColumnFormula,
  getFromTable,
  renameColumn,
  swapTableColumns,
  updateDataType,
} from 'apps/e2e/utils/page/Table';

const sanitise = (text: string | null) =>
  !!text && text.replaceAll(/[^a-zA-Z0-9£,.]/g, '');

test.describe.configure({ mode: 'serial' });

test.describe('Creating a basic model', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Set editor title', async () => {
    ControlPlus(page, 'A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Compound Interest Calculator');
    const title = await page.getByTestId('editor-title').textContent();
    expect(title).toBe('Compound Interest Calculator');
  });

  test('Create input fields', async () => {
    await createInputBelow(page, 'InitialInvestment', '£1000');
    await page.keyboard.press('Enter');
    await createInputBelow(page, 'MonthlyContribution', '£100');
    await createSliderBelow(page, 'InterestRate', '5%', {
      min: 0,
      max: 100,
      step: 1,
    });
  });

  // resulting table should be the following, columns may not necessarily be in this order
  // | Index | Year | TotalInvested | TotalMoney | TotalProfit |
  // | 1     | 2023 | £1,100        | £1,150     | £50         |
  // | 2     | 2024 | £1,200        | £1,307.5   | £107.5      |
  // | 3     | 2025 | £1,300        | £1,472.88  | £172.88     |

  test('Create Table', async () => {
    await focusOnBody(page);
    await createTable(page);

    await addColumn(page);
    await addColumn(page);

    await renameColumn(page, 0, 'Index');
    await updateDataType(page, 0, undefined, 'Sequence', 'Number');
    await clickCell(page, 1, 0);
    await page.keyboard.type('1');

    await renameColumn(page, 1, 'Year');
    await updateDataType(page, 1, undefined, 'Sequence', 'Date');
    await clickCell(page, 1, 1);
    await page.keyboard.type('2023');

    await renameColumn(page, 2, 'TotalInvested');
    await updateDataType(page, 2, undefined, 'Formula');
    await focusOnTableColumnFormula(page, 'TotalInvested');
    await page.keyboard.type(
      'previous(InitialInvestment) + MonthlyContribution'
    );

    await renameColumn(page, 3, 'TotalMoney');
    await updateDataType(page, 3, undefined, 'Formula');
    await focusOnTableColumnFormula(page, 'TotalMoney');
    await page.keyboard.type(
      '(previous(InitialInvestment) * (1 + InterestRate )) + MonthlyContribution'
    );

    await renameColumn(page, 4, 'TotalProfit');
    await updateDataType(page, 4, undefined, 'Formula');
    await focusOnTableColumnFormula(page, 'TotalProfit');
    await page.keyboard.type('TotalMoney - TotalInvested');
    await page.keyboard.press('Enter');

    // check second row values are correct
    const [index, year, totalInvested, totalMoney, totalProfit] =
      await Promise.all([
        getFromTable(page, 2, 0, false),
        getFromTable(page, 2, 1, false),
        getFromTable(page, 2, 2, true),
        getFromTable(page, 2, 3, true),
        getFromTable(page, 2, 4, true),
      ]);

    expect(sanitise(index)).toBe('2');
    expect(sanitise(year)).toBe('2024');
    expect(sanitise(totalInvested)).toBe('£1,200');
    expect(sanitise(totalMoney)).toBe('£1,307.5');
    expect(sanitise(totalProfit)).toBe('£107.5');
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test.skip('Swap columns', async () => {
    await swapTableColumns(page, 0, 2);
    await swapTableColumns(page, 0, 3);

    const [totalInvested, index, totalMoney, year, totalProfit] =
      await Promise.all([
        getFromTable(page, 2, 0, true),
        getFromTable(page, 2, 1, false),
        getFromTable(page, 2, 2, true),
        getFromTable(page, 2, 3, false),
        getFromTable(page, 2, 4, true),
      ]);

    expect(sanitise(totalInvested)).toBe('£1,200');
    expect(sanitise(index)).toBe('2');
    expect(sanitise(year)).toBe('2024');
    expect(sanitise(totalMoney)).toBe('£1,307.5');
    expect(sanitise(totalProfit)).toBe('£107.5');
  });
});
