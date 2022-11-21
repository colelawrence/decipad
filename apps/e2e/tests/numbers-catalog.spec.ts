import { BrowserContext, Page, test } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Tests the number catalog', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp({ page, context }, { createAndNavigateToNewPad: false });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('screenshots the number catalog and first article', async () => {
    await page.locator('.notebookList > li').nth(1).click();
    await waitForEditorToLoad(page);
    await snapshot(page as Page, 'Notebook: Number Catalog');
  });
});
