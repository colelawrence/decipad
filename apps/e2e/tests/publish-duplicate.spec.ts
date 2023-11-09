import { expect, test } from './manager/decipad-tests';
import { keyPress, editorLocator } from '../utils/page/Editor';
import { Timeouts, getWorkspaces } from '../utils/src';

import {
  duplicatePad,
  exportPad,
  followPad,
  getPadList,
  navigateToWorkspacePage,
} from '../utils/page/Workspace';

test('publish notebook, check logged out reader + logged in duplication', async ({
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
    sharedPageLocation = await testUser.notebook.publishNotebook(
      'Welcome-to-Decipad'
    );
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

    await randomFreeUserNotebook.waitForEditorToLoad();
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
    await unregisteredUserNotebook.waitForEditorToLoad();
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

test('duplicate in workspace with single workspace', async ({
  randomFreeUser,
}) => {
  let padToCopyIndex = -1;
  let padCopyIndex = -1;
  const { page, notebook } = randomFreeUser;
  await randomFreeUser.createAndNavNewNotebook();

  await test.step('Makes up a notebook', async () => {
    await notebook.updateNotebookTitle('pad title here');

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

  await test.step('Can reload', async () => {
    await page.reload();
    await notebook.waitForEditorToLoad();
    await expect(page.locator(editorLocator()).first()).toBeVisible();
  });

  await test.step('Check if notebook has 4 paragraphs', async () => {
    await page.getByTestId('notebook-title').click();
    await expect(page.getByText('this is the third paragraph')).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    await page.getByTestId('go-to-workspace').click();
  });

  await test.step('Notebook is listed', async () => {
    await page.getByText('pad title here').waitFor();
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex((pad) => pad.name === 'pad title here');
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  await test.step('It can duplicate a pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    await duplicatePad(page, padToCopyIndex);
    await page.getByText('Copy of pad title here').waitFor();
    const pads = await getPadList(page);
    padCopyIndex = pads.findIndex(
      (pad) => pad.name.toLocaleLowerCase() === 'copy of pad title here'
    );

    expect(padCopyIndex).toBeGreaterThanOrEqual(0);
    await followPad(page, padCopyIndex);
    await notebook.waitForEditorToLoad();
    await expect(page.getByTestId('editor-title')).toHaveText(
      'Copy of pad title here'
    );
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    await navigateToWorkspacePage(page);
  });

  await test.step('Notebook is listed again', async () => {
    await page.getByText('pad title here').last().waitFor();
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex(
      (pad) => pad.name === 'Copy of pad title here'
    );

    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  await test.step('Can export a notebook', async () => {
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

test('duplicate in workspace with multiple workspaces', async ({
  randomFreeUser,
}) => {
  const { page, notebook } = randomFreeUser;
  const NewWorkspaceName = 'NewWorkspace';
  const workspaces = await getWorkspaces(page);
  const originalWorkspace = workspaces[0].name;

  await test.step('create new workspace', async () => {
    await page.getByTestId('workspace-selector-button').click();
    await page.getByTestId('create-workspace-button').click();
    await page.getByPlaceholder('Team workspace').click();
    await page.getByPlaceholder('Team workspace').fill(NewWorkspaceName);
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      `Welcome to${NewWorkspaceName}`
    );
  });

  await test.step('new notebook', async () => {
    await randomFreeUser.newNotebook.click();
    await notebook.waitForEditorToLoad();
    await page.getByTestId('go-to-workspace').click();
    expect(page.url()).toMatch(/\/w\/[^/]+/);
  });

  await test.step('duplicate notebook to same workspace', async () => {
    await duplicatePad(page, 0, NewWorkspaceName);
    await expect(page.getByText('Copy of')).toBeVisible();
  });

  await test.step('duplicate notebook to original workspace', async () => {
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

test('duplicate inside notebook with single workspace', async ({
  randomFreeUser,
}) => {
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;
  await randomFreeUser.createAndNavNewNotebook();
  const currentDate = new Date().getTime();
  const notebookTitle = currentDate.toString();
  await randomFreeUserNotebook.updateNotebookTitle(notebookTitle);
  await randomFreeUserNotebook.duplicate();
  await randomFreeUserPage.getByTestId('go-to-workspace').click();
  await expect(
    randomFreeUserPage.getByText(`Copy of ${notebookTitle}`)
  ).toBeVisible();
});

test('duplicate inside notebook with multiple workspaces ', async ({
  randomFreeUser,
}) => {
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;

  const NewWorkspaceName = 'New Workspace';
  let notebookUrl = '';
  let newWorkspaceURL = '';
  await randomFreeUser.createAndNavNewNotebook();

  await test.step('create new workspace', async () => {
    notebookUrl = randomFreeUserPage.url();
    await randomFreeUserPage.getByTestId('go-to-workspace').click();
    await randomFreeUserPage.getByTestId('workspace-selector-button').click();
    await randomFreeUserPage.getByTestId('create-workspace-button').click();
    await randomFreeUserPage.getByPlaceholder('Team workspace').click();
    await randomFreeUserPage
      .getByPlaceholder('Team workspace')
      .fill(NewWorkspaceName);
    await randomFreeUserPage
      .getByRole('button', { name: 'Create Workspace' })
      .click();
    await expect(
      randomFreeUserPage.getByTestId('workspace-hero-title')
    ).toHaveText(`Welcome to${NewWorkspaceName}`);
    newWorkspaceURL = randomFreeUserPage.url();
  });

  await test.step('create notebook', async () => {
    await randomFreeUserPage.goto(notebookUrl);
    const currentDate = new Date().getTime();
    const notebookTitle = currentDate.toString();
    await randomFreeUserNotebook.updateNotebookTitle(notebookTitle);
    await randomFreeUserNotebook.duplicate(NewWorkspaceName);
    await randomFreeUserPage.goto(newWorkspaceURL);
    await expect(
      randomFreeUserPage.getByText(`${notebookTitle}`)
    ).toBeVisible();
  });
});

test('check collaborator duplicate single workspace', async ({
  testUser,
  randomFreeUser,
}) => {
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;
  const { page: testUserPage, notebook: testUserNotebook } = testUser;
  const currentDate = new Date().getTime();
  const notebookTitle = currentDate.toString();
  let notebookURL = '';

  await test.step('create notebook', async () => {
    await testUserNotebook.updateNotebookTitle(notebookTitle);
    notebookURL = testUserPage.url();
  });

  await test.step('invite to collaborate', async () => {
    await testUserPage.getByTestId('publish-button').click();
    await testUserPage
      .getByPlaceholder('Enter email address')
      .fill(randomFreeUser.email);
    await testUserPage.keyboard.press('Tab');
    await testUserPage.getByTestId('send-invitation').click();
  });

  await test.step('invite to collaborate', async () => {
    await randomFreeUserPage.goto(notebookURL);
    await randomFreeUserNotebook.checkNotebookTitle(notebookTitle);
    await randomFreeUserNotebook.duplicate();
    await randomFreeUserPage.goto(randomFreeUser.workspace.baseWorkspaceID);
    await expect(
      randomFreeUserPage.getByText(`${notebookTitle}`)
    ).toBeVisible();
  });
});

test('check collaborator duplicate mulpliple workspaces', async ({
  testUser,
  randomFreeUser,
}) => {
  const {
    page: randomFreeUserPage,
    notebook: randomFreeUserNotebook,
    workspace: randomFreeUserWorkspace,
  } = randomFreeUser;
  const { page: testUserPage, notebook: testUserNotebook } = testUser;
  const currentDate = new Date().getTime();
  const notebookTitle = currentDate.toString();
  let notebookURL = '';
  let newWorkspaceURL = '';
  const NewWorkspaceName = 'New workspace';

  await test.step('create notebook and invite [randomFreeUser] to collaborate', async () => {
    await testUserNotebook.updateNotebookTitle(notebookTitle);
    notebookURL = testUserPage.url();
    await testUserNotebook.inviteNotebookCollaborator(randomFreeUser.email);
  });

  await test.step('[randomFreeUser] create new workspace to duplicate shared notebook', async () => {
    newWorkspaceURL = await randomFreeUserWorkspace.newWorkspace(
      NewWorkspaceName
    );
    await randomFreeUserPage.goto(notebookURL);
    await randomFreeUserNotebook.checkNotebookTitle(notebookTitle);
    await randomFreeUserNotebook.duplicate(NewWorkspaceName);
    await randomFreeUserPage.goto(newWorkspaceURL);
    await expect(
      randomFreeUserPage.getByText(`${notebookTitle}`)
    ).toBeVisible();
  });
});
