import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('Dynamic sidebar', () => {
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
        featureFlags: {
          DYNAMIC_SIDEBAR: true,
        },
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('navigation has 4 buttons', async () => {
    const navBtns = await page.locator(
      '[data-testid="dynamic-sidebar_nav"] > button'
    );
    await expect(navBtns).toHaveCount(4);
  });
});
