import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Import Menu', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('screenshots the import menu', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/t');
    await expect(page.getByTestId('menu-item-table')).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(3);
    await page.keyboard.press('Backspace');
    await page.keyboard.type('integrations');
    await page.keyboard.press('Enter');
    await snapshot(page as Page, 'Notebook: Import Menu');
    await page.keyboard.press('Backspace');
  });
});
