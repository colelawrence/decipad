import { BrowserContext, expect, Page, test } from '@playwright/test';
import { keyPress, setUp } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Import Menu', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp({ page, context });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('screenshots the import menu', async () => {
    await keyPress(page, 'Enter');
    await page.keyboard.type('hello world');
    await keyPress(page, 'Enter');
    await page.keyboard.type('/');

    await expect(page.locator('[data-testid="menu-item-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      3
    );

    await page.keyboard.type('integrations');
    await keyPress(page, 'Enter');

    await snapshot(page as Page, 'Notebook: Import Menu');

    await keyPress(page, 'Backspace');
  });
});
