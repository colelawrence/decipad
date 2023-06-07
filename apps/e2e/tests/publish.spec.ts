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
    context = await page.context();
    incognito = await browser.newContext();
    randomUser = await browser.newContext();
    incognitoPage = await incognito.newPage();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('starts empty', async () => {
    await expect(page.locator('[data-testid=paragraph-content]')).toHaveText(
      ''
    );
  });

  test('can write some stuff', async () => {
    await focusOnBody(page);
    await page.keyboard.type(someText);
    await expect(
      page.locator('[data-testid="paragraph-wrapper"] >> nth=0')
    ).toHaveText(someText);
    await keyPress(page, 'Enter');
    await page.keyboard.type(moreText);
    await expect(
      page.locator('[data-testid="paragraph-wrapper"] >> nth=1')
    ).toHaveText(moreText);
    await keyPress(page, 'Enter');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('it can share', async () => {
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    await page.locator('[data-test-id="copy-published-link"]').click();
    const clipboardText = (
      (await page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    expect(clipboardText).toContain('My-notebook-title');
    sharedPageLocation = clipboardText;
  });

  test('[incognito] navigates to published notebook link', async () => {
    await incognitoPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(incognitoPage);
    await expect(
      incognitoPage.locator('[data-testid="paragraph-wrapper"] >> nth=0')
    ).toHaveText(someText);
    await expect(
      incognitoPage.locator('[data-testid="paragraph-wrapper"] >> nth=1')
    ).toHaveText(moreText);
    await incognitoPage.waitForSelector('text=Try Decipad');
  });

  test('[another user] navigates to published notebook link', async () => {
    const randomPage = await randomUser.newPage();
    await withTestUser({ context: randomUser, page: randomPage });

    await randomPage.goto(sharedPageLocation!);

    await waitForNotebookToLoad(randomPage);
    await expect(
      randomPage.locator('[data-testid="paragraph-wrapper"] >> nth=0')
    ).toHaveText(someText);
    await expect(
      randomPage.locator('[data-testid="paragraph-wrapper"] >> nth=1')
    ).toHaveText(moreText);
    await randomPage.waitForSelector('text=Duplicate');
  });

  test('can write one more paragraph', async () => {
    await focusOnBody(page);
    await keyPress(page, 'Enter');
    await page.keyboard.type(justOneMore);
    await expect(
      page.locator('[data-testid="paragraph-wrapper"] >> nth=1')
    ).toHaveText(justOneMore);
    await keyPress(page, 'Enter');
  });

  test('it can re-publish', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.locator('[data-testid=publish-changes]').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('[incognito] see the republished state', async () => {
    await incognitoPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(incognitoPage);
    await expect(
      page.locator('[data-testid="paragraph-wrapper"] >> nth=1')
    ).toHaveText(justOneMore);
  });

  test("it shouldn't ask people to republish if no changes exist", async () => {
    await expect(await page.locator('text=Publish New Changes')).toHaveCount(0);
  });
});
