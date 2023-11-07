import { BrowserContext, expect, Page, test } from './manager/decipad-tests';
import {
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

test('simple notebook publish', async ({
  testUser,
  randomFreeUser,
  unregisteredUser,
}) => {
  let sharedPageLocation: string | null;
  const { page: unregisteredUserPage, notebook: unregisteredUserNotebook } =
    unregisteredUser;
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;
  const { page: testUserPage, notebook: testUserNotebook } = testUser;
  const someText = 'Some text to show in the editor';
  const moreText = 'Should work even with some delay';
  const justOneMore = 'One more time we gonna celibate';

  await test.step('create notebook', async () => {
    await expect(testUserPage.getByTestId('paragraph-content')).toHaveText('');
    await testUserNotebook.focusOnBody();
    await testUserPage.keyboard.type(someText);
    await expect(testUserNotebook.notebookParagraph.nth(0)).toHaveText(
      someText
    );
    await testUserPage.keyboard.press('Enter');
    await testUserPage.keyboard.type(moreText);
    await expect(testUserNotebook.notebookParagraph.nth(1)).toHaveText(
      moreText
    );
    await testUserPage.keyboard.press('Enter');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUserPage.waitForTimeout(Timeouts.syncDelay);
  });

  await test.step('share notebook', async () => {
    sharedPageLocation = await testUser.notebook.publishNotebook();
  });

  await test.step('[unregisteredUser] navigates to published notebook link', async () => {
    await unregisteredUserPage.goto(sharedPageLocation!);
    await unregisteredUserNotebook.waitForEditorToLoad();
    await expect(unregisteredUserNotebook.notebookParagraph.nth(0)).toHaveText(
      someText
    );
    await expect(unregisteredUserNotebook.notebookParagraph.nth(1)).toHaveText(
      moreText
    );
    await unregisteredUserPage.getByText('Try Decipad').waitFor();
  });

  await test.step('[randomFreeUser] navigates to published notebook link', async () => {
    await randomFreeUserPage.goto(sharedPageLocation!);

    await waitForNotebookToLoad(randomFreeUserPage);
    await expect(randomFreeUserNotebook.notebookParagraph.nth(0)).toHaveText(
      someText
    );
    await expect(randomFreeUserNotebook.notebookParagraph.nth(1)).toHaveText(
      moreText
    );
    await randomFreeUserPage.getByText('Duplicate').click();
    // Waits for the share button to be visible, meaning the notebook was duplicated
    await expect(
      randomFreeUserPage.getByTestId('publish-button')
    ).toBeVisible();

    // checks for original content
    await expect(randomFreeUserNotebook.notebookParagraph.nth(0)).toHaveText(
      someText
    );
    await expect(randomFreeUserNotebook.notebookParagraph.nth(1)).toHaveText(
      moreText
    );
  });

  await test.step('add one more paragraph', async () => {
    await testUserNotebook.focusOnBody();
    await keyPress(testUserPage, 'Enter');
    await testUserPage.keyboard.type(justOneMore);
    await expect(testUserNotebook.notebookParagraph.nth(1)).toHaveText(
      justOneMore
    );
    await keyPress(testUserPage, 'Enter');
  });

  await test.step('re-publish notebook', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUserPage.waitForTimeout(Timeouts.syncDelay);
    await testUserPage.getByRole('button').getByText('Share').click();
    await testUserPage.getByTestId('publish-changes').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUserPage.waitForTimeout(Timeouts.syncDelay);
  });

  await test.step('[unregisteredUser] see the republished state', async () => {
    await unregisteredUserPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(unregisteredUserPage);
    await expect(
      unregisteredUserPage.getByTestId('paragraph-wrapper').nth(1)
    ).toHaveText(justOneMore);
  });

  await test.step("check it doesn't ask to share new changes", async () => {
    await expect(testUserPage.getByText('Share with new changes')).toHaveCount(
      0
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
