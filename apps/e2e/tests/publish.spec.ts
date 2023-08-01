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
  let incognito: BrowserContext;
  let randomUser: BrowserContext;
  let incognitoPage: Page;
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
    await page.keyboard.press('Enter');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('it can share', async () => {
    await page.getByRole('button', { name: 'Share' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await page.getByTestId('copy-published-link').click();
    const clipboardText = (
      (await page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    expect(clipboardText).toContain('My-notebook');
    sharedPageLocation = clipboardText;
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('[incognito] navigates to published notebook link', async ({
    browser,
  }) => {
    incognito = await browser.newContext();
    incognitoPage = await incognito.newPage();
    await incognitoPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(incognitoPage);
    await expect(
      incognitoPage.getByTestId('paragraph-wrapper').nth(0)
    ).toHaveText(someText);
    await expect(
      incognitoPage.getByTestId('paragraph-wrapper').nth(1)
    ).toHaveText(moreText);
    await incognitoPage.getByText('Try Decipad').waitFor();
  });

  test('[another user] navigates to published notebook link', async ({
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
    await randomPage.getByText('Duplicate').waitFor();
  });

  test('can write one more paragraph', async () => {
    await focusOnBody(page);
    await keyPress(page, 'Enter');
    await page.keyboard.type(justOneMore);
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      justOneMore
    );
    await keyPress(page, 'Enter');
  });

  test('it can re-publish', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByRole('button').getByText('Share').click();
    await page.getByTestId('publish-changes').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('[incognito] see the republished state', async () => {
    await incognitoPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(incognitoPage);
    await expect(
      incognitoPage.getByTestId('paragraph-wrapper').nth(1)
    ).toHaveText(justOneMore);
  });

  test("it shouldn't ask people to republish if no changes exist", async () => {
    await expect(page.getByText('Share with new changes')).toHaveCount(0);
  });
});
