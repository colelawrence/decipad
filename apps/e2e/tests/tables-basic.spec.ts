import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import {
  createTable,
  focusOnTable,
  getFromTable,
  insertRowAbove,
  insertRowBelow,
  writeInTable,
  deleteTable,
} from '../utils/page/Table';

test.describe('Basic Table', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

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

  test('creates table', async () => {
    await focusOnBody(page);
    await createTable(page);
  });

  test('deletes table and created a new table to check for name collisions', async () => {
    await deleteTable(page);
    await createTable(page);
    await expect(
      await page.getByTestId('code-line-warning').count(),
      `calculation errors`
    ).toBe(0);
  });

  test('fills table', async () => {
    // first column
    await writeInTable(page, 'Imports', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Imports');
    await writeInTable(page, 'Hydro, wind and solar', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Hydro, wind and solar');
    await writeInTable(page, 'Bioenergy', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Bioenergy');

    // second column
    await writeInTable(page, '0.68%', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('0.68%');
    await writeInTable(page, '3.02%', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('3.02%');
    await writeInTable(page, '9.32%', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('9.32%');
  });

  test('updates table name', async () => {
    await page.getByTestId('table-name-input').dblclick();
    await page.keyboard.type('NewTableName');
    await expect(page.getByText('NewTableName')).toBeVisible();
  });

  test('can insert a new row below', async () => {
    await focusOnTable(page);
    await insertRowBelow(page, 3);
    await writeInTable(page, '1%', 4, 1);
    expect(await getFromTable(page, 4, 1)).toBe('1%');
  });

  test('can insert a new row above', async () => {
    await focusOnTable(page);
    await insertRowAbove(page, 4);
    // row 4 with 1% is now row 5
    expect(await getFromTable(page, 5, 1)).toBe('1%');
  });
});
