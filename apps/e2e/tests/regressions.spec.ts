import { expect, test, BrowserContext, Page } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { createCalculationBlockBelow } from '../utils/page/Block';

test.describe("can't define same variable twice @language @advanced-formula @regression", () => {
  let page: Page;
  let context: BrowserContext;

  test.describe.configure({ mode: 'serial' });
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

  test('initial page title is the same as new notebook', async () => {
    await waitForEditorToLoad(page);
    await createCalculationBlockBelow(page, 'variable  = 2');
    await createCalculationBlockBelow(page, 'variable = 5');
    await expect(page.getByTestId('code-line-warning')).toBeVisible();
  });
});
