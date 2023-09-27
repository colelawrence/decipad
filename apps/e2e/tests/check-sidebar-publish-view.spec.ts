import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { Timeouts, withTestUser } from '../utils/src';
import { clickNewPadButton } from '../utils/page/Workspace';

test.describe('check sidebar in publish view', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedPageLocation: string | null;
  let page: Page;
  let context: BrowserContext;
  let randomUser: BrowserContext;
  let randomPage: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('publish notebook', async () => {
    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByTestId('publish-tab').click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await page.getByTestId('copy-published-link').click();
    const clipboardText = (
      (await page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    expect(clipboardText).toContain('Welcome-to-Decipad');
    sharedPageLocation = clipboardText;
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('[another user] navigates to published notebook link', async ({
    browser,
  }) => {
    randomUser = await browser.newContext();
    randomPage = await randomUser.newPage();
    await withTestUser({ context: randomUser, page: randomPage });
  });

  test('[another user] create notebook and open sidebar', async () => {
    await clickNewPadButton(randomPage);
    await waitForEditorToLoad(randomPage);
    await expect(randomPage.getByTestId('editor-sidebar')).toBeHidden();
    await randomPage
      .getByTestId('segment-button-trigger-top-bar-sidebar')
      .click();
    await expect(randomPage.getByTestId('editor-sidebar')).toBeVisible();
  });

  test('[another user] check sidebar open in a published notebook from another user', async () => {
    await randomPage.goto(sharedPageLocation!);
    await waitForEditorToLoad(randomPage);
    await expect(randomPage.getByTestId('editor-sidebar')).toBeHidden();
  });
});
