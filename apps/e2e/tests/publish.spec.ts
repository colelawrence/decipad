import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  ControlPlus,
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { Timeouts, withTestUser } from '../utils/src';

const someText = 'Some text to show in the editor';
const moreText = 'Should work even with some delay';
const justOneMore = 'One more time we gonna celibate';
test.describe('Simple does publish work test', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedPageLocation: string;
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
    await waitForEditorToLoad(page, { showChecklist: false });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('starts empty', async () => {
    const paragraph = '[data-testid=paragraph-content]';
    expect((await page.textContent(paragraph))!.trim()).toBe('');
  });

  test('can write some stuff', async () => {
    await focusOnBody(page);
    await page.keyboard.type(someText);
    const firstParagraph = await page.waitForSelector(
      '[data-slate-editor] p >> nth=0'
    );
    expect(await firstParagraph.textContent()).toBe(someText);
    await keyPress(page, 'Enter');
    await page.keyboard.type(moreText);
    const thirdParagraph = await page.waitForSelector(
      '[data-slate-editor] p >> nth=1'
    );
    expect(await thirdParagraph.textContent()).toBe(moreText);
    await keyPress(page, 'Enter');

    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('it can share', async () => {
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    await page
      .locator('[aria-roledescription="copy url to clipboard"]')
      .click();
  });

  test('it can copy paste the url from the shared notebook', async ({
    baseURL,
  }) => {
    const locatorOfUrl = '[data-slate-editor] p >> nth=2';
    const fourthParagraph = await page.waitForSelector(locatorOfUrl);
    await ControlPlus(page, 'v');
    await focusOnBody(page);
    await page.waitForTimeout(Timeouts.typing);
    sharedPageLocation = (await fourthParagraph.textContent()) || '';
    sharedPageLocation = (
      baseURL
        ? `/${sharedPageLocation.replace(baseURL, '')}`
        : sharedPageLocation
    ).replace(/\ufeff/gi, '');
    expect(sharedPageLocation).toContain('My-notebook-title');
    expect(sharedPageLocation).toContain('/n/');
    expect(sharedPageLocation).not.toContain('//n/');
    expect(sharedPageLocation).not.toContain('Connect Table');
  });

  test('[incognito] navigates to published notebook link', async () => {
    await incognitoPage.goto(sharedPageLocation);
    await waitForEditorToLoad(incognitoPage);
    const firstParagraph = await incognitoPage.waitForSelector(
      '[data-slate-editor] p >> nth=0'
    );
    expect(await firstParagraph.textContent()).toBe(someText);
    const thirdParagraph = await incognitoPage.waitForSelector(
      '[data-slate-editor] p >> nth=1'
    );
    expect(await thirdParagraph.textContent()).toBe(moreText);
    await incognitoPage.waitForSelector('text=Try Decipad');
  });

  test('[another user] navigates to published notebook link', async () => {
    const randomPage = await randomUser.newPage();
    await withTestUser({ context: randomUser, page: randomPage });

    await randomPage.goto(sharedPageLocation);

    await waitForEditorToLoad(randomPage);
    const firstParagraph = await randomPage.waitForSelector(
      '[data-slate-editor] p >> nth=0'
    );
    expect(await firstParagraph.textContent()).toBe(someText);
    const thirdParagraph = await randomPage.waitForSelector(
      '[data-slate-editor] p >> nth=1'
    );
    expect(await thirdParagraph.textContent()).toBe(moreText);
    await randomPage.waitForSelector('text=Duplicate');
  });

  test('can write one more paragraph', async () => {
    await focusOnBody(page);
    await keyPress(page, 'Enter');
    await page.keyboard.type(justOneMore);
    const secondParagraph = await page.waitForSelector(
      '[data-slate-editor] p >> nth=1'
    );
    expect(await secondParagraph.textContent()).toBe(justOneMore);
    await keyPress(page, 'Enter');
  });

  test('it can re-publish', async () => {
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('text=Publish New Changes').click();
  });

  test('[incognito] see the republished state', async () => {
    await incognitoPage.goto(sharedPageLocation);
    await waitForEditorToLoad(incognitoPage);
    const secondParagraph = await page.waitForSelector(
      '[data-slate-editor] p >> nth=1'
    );
    expect(await secondParagraph.textContent()).toBe(justOneMore);
  });

  test('it shouldnt ask people to republish if no changes exist', async () => {
    expect(await page.locator('text=Publish New Changes').count()).toEqual(0);
  });
});
