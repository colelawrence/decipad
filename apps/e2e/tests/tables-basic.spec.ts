import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createTable, writeInTable, getFromTable } from '../utils/page/Table';

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
    await page.getByText('Table1', { exact: true }).dblclick();
    await page.keyboard.type('NewTableName');
    await expect(page.getByText('NewTableName')).toBeVisible();
  });
});
