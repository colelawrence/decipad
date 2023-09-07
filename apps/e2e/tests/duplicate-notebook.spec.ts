import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
  waitForNotebookToLoad,
} from '../utils/page/Editor';
import { Timeouts, withTestUser } from '../utils/src';

const someText = 'Some text to show in the editor';
const moreText = 'Should work even with some delay';
const justOneMore = 'One more time we gonna celibate';
test.describe('Simple does publish work test', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedPageLocation: string | null;
  let page: Page;
  let context: BrowserContext;
  let randomUser: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('starts empty', async () => {
    await expect(page.getByTestId('paragraph-content')).toHaveText('');
  });

  test('can write some stuff', async () => {
    await focusOnBody(page);
    await page.keyboard.type(someText);
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      someText
    );
    await page.keyboard.press('Enter');
    await page.keyboard.type(moreText);
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      moreText
    );
  });

  test('share notebook', async () => {
    // delay for the changes to sync before publishing
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    await page.getByTestId('publish-button').click();
    await page.getByTestId('publish-tab').click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Anyone with link can view')).toBeVisible();
    await page.getByTestId('copy-published-link').click();
    const clipboardText = (
      (await page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    sharedPageLocation = clipboardText;
    expect(clipboardText).toContain('Welcome-to-Decipad');
  });

  test('[another registered user] duplicates notebook and adds text', async ({
    browser,
  }) => {
    randomUser = await browser.newContext();
    const randomPage = await randomUser.newPage();
    await withTestUser({ context: randomUser, page: randomPage });

    await randomPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(randomPage);

    await expect(randomPage.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      someText
    );
    await expect(randomPage.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      moreText
    );
    await randomPage.getByTestId('duplicate-button').click();
    // Waits for the share button to be visible, meaning the notebook was duplicated
    await expect(randomPage.getByTestId('publish-button')).toBeVisible();

    // checks for original content
    await expect(randomPage.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      someText
    );
    await expect(randomPage.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      moreText
    );

    // checks duplicated notebook can be edited
    await focusOnBody(randomPage);
    await keyPress(randomPage, 'Enter');
    await randomPage.keyboard.type(justOneMore);
    await expect(randomPage.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      justOneMore
    );
  });
});
