import { BrowserContext, expect, Page, test } from '@playwright/test';
import { keyPress, setUp } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Slash commands', () => {
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

  test('screenshots the slash commands', async () => {
    await keyPress(page, 'Enter');
    await page.keyboard.type('hello world');
    await keyPress(page, 'Enter');
    await page.keyboard.type('/t');

    await expect(page.locator('[data-testid="menu-item-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      3
    );

    await snapshot(page as Page, 'Notebook: Slash Command');

    await keyPress(page, 'Backspace');
  });
});
