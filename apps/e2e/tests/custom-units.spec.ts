import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createTable, writeInTable, addColumnUnit } from '../utils/page/Table';

test.describe('Tests Custom Units', () => {
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

  test('creates table with units', async () => {
    await focusOnBody(page);
    await createTable(page);
    await addColumnUnit(page, 1, 'bananas');
    // second column
    await writeInTable(page, '1', 1, 1);
    await writeInTable(page, '2', 2, 1);
    await writeInTable(page, '3', 3, 1);
    const locator = page.locator('span[data-unit="bananas"]');
    expect(await locator.count()).toBe(3);
  });
});
