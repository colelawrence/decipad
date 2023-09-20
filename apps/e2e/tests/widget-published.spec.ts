import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  setUp,
  waitForEditorToLoad,
  waitForNotebookToLoad,
} from '../utils/page/Editor';
import { createDateBelow } from '../utils/page/Block';
import { Timeouts } from '../utils/src';

test.describe('date widget read mode', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedPageLocation: string | null;
  let page: Page;
  let context: BrowserContext;
  let incognito: BrowserContext;
  let incognitoPage: Page;
  let formattedDate: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('adds date widget', async () => {
    await createDateBelow(page, 'Input3');

    await page.getByTestId('widget-input').click();
    await page.getByText('Today').click();

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;

    await expect(page.getByTestId('widget-input')).toContainText(formattedDate);
  });

  test('publish notebook', async () => {
    await page.getByTestId('publish-button').click();
    await page.getByTestId('publish-tab').click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByTestId('copy-published-link').click();
    sharedPageLocation = (
      (await page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    expect(sharedPageLocation).toContain('Welcome-to-Decipad');
  });

  test('[incognito] navigates to published notebook and updates date widget', async ({
    browser,
  }) => {
    incognito = await browser.newContext();
    incognitoPage = await incognito.newPage();
    await incognitoPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(incognitoPage);
    await incognitoPage.getByTestId('widget-input').click();
    await incognitoPage.locator('text=Today').click();
    await expect(incognitoPage.getByTestId('widget-input')).toContainText(
      formattedDate
    );
  });
});
