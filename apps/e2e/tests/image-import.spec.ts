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
    await expect(
      page.getByTestId('notebook-image-block').locator('img')
    ).toBeVisible();
  });

  test('delete image imported via file', async () => {
    await page.getByTestId('drag-handle').nth(1).click();
    await page.getByRole('menuitem', { name: 'Delete Delete' }).click();
    await expect(
      page.getByTestId('notebook-image-block').locator('img')
    ).toBeHidden();
  });

  test('Importing image via link', async () => {
    await page.getByTestId('paragraph-content').last().fill('/');
    await page.getByTestId('menu-item-upload-image').click();
    await page.getByTestId('link-file-tab').click();
    await page
      .getByTestId('upload-link-input')
      .fill(
        'https://app.decipad.com/docs/assets/images/image_collab-1be976675d57684cb0a1223a5d6551ff.png'
      );
    await page.getByTestId('link-button').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(
      page.getByTestId('notebook-image-block').locator('img')
    ).toBeVisible();
  });
});
