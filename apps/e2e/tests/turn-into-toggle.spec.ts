import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { createWorkspace, Timeouts } from '../utils/src';

test.describe('Make sure the toggle conversion works', () => {
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

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Checks all the files', async () => {
    await page.getByTestId('paragraph-content').last().fill('/i');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByTestId('menu-item-input').click();
    await page.getByTestId('drag-handle').first().click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByText('Turn into').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByText('Toggle').click();
    await expect(page.getByTestId('widget-editor:false')).toBeHidden();
  });
});
