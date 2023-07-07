import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { createWorkspace } from '../utils/src';

test.describe('Makes sure triple click or more does not crash app', () => {
  test.describe.configure({ mode: 'serial' });

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

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Simulation of triple click or more through two double clicks', async () => {
    await page.getByTestId('paragraph-content').last().fill('test test test');
    await page.getByText('test test test').dblclick();
    await page.getByText('test test test').dblclick();
    await page.keyboard.press('Backspace');
    await expect(page.getByText('Contact support')).toBeHidden();
  });
});
