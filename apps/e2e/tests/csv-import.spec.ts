import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { Timeouts } from '../utils/src';
import { createCSVBelow } from '../utils/page/Block';

test.describe('Testing CSV imports', () => {
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
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Importing csv link through csv panel', async () => {
    await createCSVBelow(page);
    await page.getByRole('button', { name: 'Choose file' }).first().click();
    await page.getByTestId('embed-file-tab').click();
    await page
      .getByTestId('upload-link-input')
      .fill(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlmKKmOm0b22FcmTTiLy44qz8TPtSipfvnd1hBpucDISH4p02r3QuCKn3LIOe2UFxotVpYdbG8KBSf/pub?gid=0&single=true&output=csv'
      );
    await page.getByTestId('embed-csv-button').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(
      page.getByTestId('live-code').getByTestId('loading-animation')
    ).toBeHidden();
  });

  test('Importing csv file through csv panel', async () => {
    await createCSVBelow(page);
    await page.getByTestId('upload-file-tab').click();
    await page.getByRole('button', { name: 'Choose file' }).click();
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Choose file').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./__fixtures__/csv/accounts.csv');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(
      page.getByTestId('live-code').getByTestId('loading-animation')
    ).toBeHidden();
    await page
      .getByTestId('integration-block')
      .filter({ hasText: /accounts_c/ })
      .getByTestId('segment-button-trigger')
      .click();
    await expect(
      page.getByText('7109 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });
});
