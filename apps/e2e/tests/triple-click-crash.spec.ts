import { BrowserContext, Page, test, expect } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createWorkspace, Timeouts } from '../utils/src';

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
    await focusOnBody(page);
    await page.keyboard.insertText('test test test');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    await page.getByText('test test test').dblclick();
    await page.getByText('test test test').dblclick();
    await page.keyboard.press('Backspace');
    await expect(page.getByText('Contact support')).toBeHidden();
  });
});
