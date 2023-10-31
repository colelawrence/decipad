import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
  waitForNotebookToLoad,
  editorTitleLocator,
  editorLocator,
} from '../utils/page/Editor';
import { Timeouts, withTestUser, getWorkspaces } from '../utils/src';

import {
  clickNewPadButton,
  duplicatePad,
  exportPad,
  followPad,
  getPadList,
  navigateToWorkspacePage,
} from '../utils/page/Workspace';

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

test.describe('Duplicating a notebook', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let padToCopyIndex = -1;
  let padCopyIndex = -1;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    withTestUser({ page, context });
    await page.getByTestId('new-notebook').click();
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Makes up a notebook', async () => {
    await page.locator(editorTitleLocator()).first().fill('pad title here');

    await page
      .getByTestId('paragraph-content')
      .last()
      .fill('this is the first paragraph');

    await page
      .getByTestId('paragraph-content')
      .last()
      .fill('this is the second paragraph');

    await page
      .getByTestId('paragraph-content')
      .last()
      .fill('this is the third paragraph');
  });

  test('Can reload', async () => {
    await page.reload();
    await waitForEditorToLoad(page);
    await expect(page.locator(editorLocator()).first()).toBeVisible();
  });

  test('Check if notebook has 4 paragraphs', async () => {
    await page.getByTestId('notebook-title').click();
    await expect(page.getByText('this is the third paragraph')).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    await page.getByTestId('go-to-workspace').click();
  });

  test('Notebook is listed', async () => {
    await page.getByText('pad title here').waitFor();
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex((pad) => pad.name === 'pad title here');
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  test('It can duplicate a pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    await duplicatePad(page, padToCopyIndex);
    await page.getByText('Copy of pad title here').waitFor();
    const pads = await getPadList(page);
    padCopyIndex = pads.findIndex(
      (pad) => pad.name.toLocaleLowerCase() === 'copy of pad title here'
    );

    expect(padCopyIndex).toBeGreaterThanOrEqual(0);
    await followPad(page, padCopyIndex);
    await waitForEditorToLoad(page);
    await expect(page.getByTestId('editor-title')).toHaveText(
      'Copy of pad title here'
    );
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    await navigateToWorkspacePage(page);
  });

  test('Notebook is listed again', async () => {
    await page.getByText('pad title here').last().waitFor();
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex(
      (pad) => pad.name === 'Copy of pad title here'
    );

    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  test('Can export a notebook', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);

    expect(JSON.parse(await exportPad(page, padToCopyIndex))).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'Copy of pad title here',
            },
          ],
          type: 'title',
          id: expect.any(String),
        },
        {
          children: [
            {
              children: [
                {
                  text: 'this is the first paragraph',
                },
              ],
              type: 'p',
              id: expect.any(String),
            },
            {
              children: [
                {
                  text: 'this is the second paragraph',
                },
              ],
              type: 'p',
              id: expect.any(String),
            },
            {
              children: [
                {
                  text: 'this is the third paragraph',
                },
              ],
              type: 'p',
              id: expect.any(String),
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'p',
              id: expect.any(String),
            },
          ],
          type: 'tab',
          name: expect.any(String),
          id: expect.any(String),
        },
      ],
    });
  });
});

test.describe('check notebook duplicate stays in the same workspace', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  const NewWorkspaceName = 'NewWorkspace';
  let originalWorkspace: string | undefined;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        randomUser: true,
      }
    );
    await waitForEditorToLoad(page);
    const workspaces = await getWorkspaces(page);
    originalWorkspace = workspaces[0].name;
  });

  test('create new workspace', async () => {
    await page.getByTestId('go-to-workspace').click();
    await page.getByTestId('workspace-selector-button').click();
    await page.getByTestId('create-workspace-button').click();
    await page.getByPlaceholder('Team workspace').click();
    await page.getByPlaceholder('Team workspace').fill(NewWorkspaceName);
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      `Welcome to${NewWorkspaceName}`
    );
  });

  test('new notebook', async () => {
    await clickNewPadButton(page);
    await waitForEditorToLoad(page);
    await page.getByTestId('go-to-workspace').click();
    expect(page.url()).toMatch(/\/w\/[^/]+/);
  });

  test('duplicate notebook to same workspace', async () => {
    await duplicatePad(page, 0, NewWorkspaceName);
    await expect(page.getByText('Copy of')).toBeVisible();
  });

  test('duplicate notebook to original workspace', async () => {
    await duplicatePad(page, 0, originalWorkspace);
    // go back to orginal workspace
    await page.getByTestId('workspace-selector-button').click();
    await page
      .getByTestId('workspace-picker')
      .filter({ hasText: originalWorkspace })
      .click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      `Welcome to${originalWorkspace}`
    );
    await expect(page.getByText('Copy of')).toBeVisible();
  });
});
