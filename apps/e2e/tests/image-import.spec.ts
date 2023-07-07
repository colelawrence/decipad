// <reference lib="dom"/>
import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { Timeouts, createWorkspace } from '../utils/src';

test.describe('Make sure importing images work', () => {
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

  test('Importing image through file explorer', async () => {
    await page.getByTestId('paragraph-content').last().fill('/');
    await page.getByTestId('menu-item-upload-image').first().waitFor();
    await page.getByTestId('menu-item-upload-image').first().click();
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Choose file').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./__fixtures__/images/download.png');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(page.getByRole('figure').locator('img')).toBeVisible();
  });
});
