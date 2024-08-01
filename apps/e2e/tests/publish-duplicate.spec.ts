/* eslint-disable playwright/valid-describe-callback */
/* eslint-disable playwright/valid-title */
/* eslint-disable playwright/no-skipped-test */
import { expect, test } from './manager/decipad-tests';
import { keyPress, editorLocator } from '../utils/page/Editor';
import { Timeouts, getWorkspaces, timeout, snapshot } from '../utils/src';
import oldNotebookJson from '../__fixtures__/011-old-notebook-json.json';

import {
  duplicatePad,
  exportPad,
  followPad,
  getPadList,
  navigateToWorkspacePage,
} from '../utils/page/Workspace';

const someText = 'Some text to show in the editor';
const moreText = 'Should work even with some delay';
const justOneMore = 'One more time we gonna celibate';
const unpublishedParagraph = 'This paragraph isnt published';

// tests on this file can't be ran in paparell, make them flaky, might be related to the workspace reuse
test.describe.configure({ mode: 'serial' });

test('check private url publishing on free workspace', async ({ testUser }) => {
  await test.step('create notebook', async () => {
    await testUser.notebook.focusOnBody();
  });

  await test.step('share notebook', async () => {
    await testUser.notebook.publishNotebook('Welcome-to-Decipad');
    await testUser.page.getByTestId('publish-dropdown').click();
    await expect(testUser.page.getByTestId('upgrade-badge')).toBeVisible();
    await testUser.page.getByTestId('publish-private-url').click();
    await expect(testUser.page.getByText('Choose a plan')).toBeVisible();
    await snapshot(testUser.page, 'Notebook: Upgrade Plan');
  });
});

test('check private url publishing on paid workspace', async ({ testUser }) => {
  await test.step('create notebook on paid workspace', async () => {
    await testUser.page.goto('/');
    await testUser.workspace.newWorkspaceWithPlan('plus');
    await testUser.workspace.clickNewPadButton();
    await testUser.notebook.focusOnBody();
  });

  await test.step('share notebook', async () => {
    await testUser.notebook.publishNotebook('Welcome-to-Decipad');
    await testUser.page.getByTestId('publish-dropdown').click();
    await expect(
      testUser.page.getByTestId('publish-private-url')
    ).toBeVisible();
    await expect(testUser.page.getByTestId('upgrade-badge')).toBeHidden();
    await testUser.page.getByTestId('publish-private-url').click();
    await expect(testUser.page.getByTestId('publish-private-url')).toBeHidden();
    await expect(testUser.page.getByText('Choose a plan')).toBeHidden();
    await expect(
      testUser.page.getByText('Allow readers to duplicate')
    ).toBeVisible();
  });
});

test('publish notebook, check logged out reader + logged in duplication', async ({
  testUser,
  anotherTestUser,
  unregisteredUser,
}) => {
  test.setTimeout(120000);
  test.slow();
  let sharedPageLocation: string | null;
  const { page: unregisteredUserPage, notebook: unregisteredUserNotebook } =
    unregisteredUser;
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    anotherTestUser;
  const { page: testUserPage, notebook: testUserNotebook } = testUser;

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
    await randomFreeUserPage.getByRole('button', { name: 'Duplicate' }).click();

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

  await test.step('create new table then republish', async () => {
    await testUser.notebook.createTab('Published Tab');
    await testUser.page.getByTestId('publish-changes').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUserPage.waitForTimeout(Timeouts.syncDelay);
  });

  await test.step('[unregisteredUser] see the new tab', async () => {
    await unregisteredUserPage.goto(sharedPageLocation!);
    await unregisteredUserNotebook.waitForEditorToLoad();
    await expect(unregisteredUserPage.getByText('Published Tab')).toBeVisible();
  });
});

test('duplicating only the published changes', async ({
  testUser,
  anotherTestUser,
}) => {
  const { page: testUserPage, notebook: testUserNotebook } = testUser;
  const { page: anotherTestUserPage, notebook: anotherTestUserNotebook } =
    anotherTestUser;

  let sharedPageLocation = '';

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

  await test.step('add paragraph but dont publish (and checks the unpublished notification)', async () => {
    await testUserNotebook.focusOnBody(-1);

    await testUserPage.keyboard.type(unpublishedParagraph);
    await expect(testUserNotebook.notebookParagraph.nth(-2)).toHaveText(
      unpublishedParagraph
    );
    await expect(testUserNotebook.republishNotification).toBeVisible();
    await testUserPage.goBack();
    await testUserPage.goForward();
    await expect(testUserNotebook.republishNotification).toBeVisible();
  });

  await test.step('[anotherTestUser] should only see the published changes', async () => {
    await anotherTestUserPage.goto(sharedPageLocation);
    await anotherTestUserNotebook.waitForEditorToLoad();

    await expect(
      anotherTestUserPage.getByTestId('paragraph-wrapper').nth(0)
    ).toHaveText(someText);
    await expect(
      anotherTestUserPage.getByTestId('paragraph-wrapper').nth(1)
    ).toHaveText(moreText);
    await expect(
      anotherTestUserPage.getByTestId('paragraph-wrapper').nth(2)
    ).toHaveText('');

    await anotherTestUserNotebook.topRightDuplicateNotebook.click();
    await expect(anotherTestUserNotebook.notebookActions).toBeVisible();

    await expect(
      anotherTestUserPage.getByTestId('paragraph-wrapper').nth(0)
    ).toHaveText(someText);
    await expect(
      anotherTestUserPage.getByTestId('paragraph-wrapper').nth(1)
    ).toHaveText(moreText);
    await expect(
      anotherTestUserPage.getByTestId('paragraph-wrapper').nth(2)
    ).toHaveText('');
  });
});

test('duplicate in workspace with single workspace', async ({
  randomFreeUser,
}) => {
  test.slow();
  let padToCopyIndex = -1;
  let padCopyIndex = -1;
  const { page, notebook } = randomFreeUser;
  await randomFreeUser.createAndNavNewNotebook();

  await test.step('Makes up a notebook', async () => {
    await notebook.updateNotebookTitle('pad title here');

    await page.getByTestId('paragraph-content').last().click();
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

    await timeout(Timeouts.syncDelay);
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
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.redirectDelay);
    await page.getByTestId('segment-button-trigger-back-to-home').click();
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
          type: 'data-tab',
          id: expect.any(String),
          children: [],
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
  test.slow();
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
    await randomFreeUser.workspace.newNotebook.click();
    await notebook.waitForEditorToLoad();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.redirectDelay);
    await page.getByTestId('segment-button-trigger-back-to-home').click();
    expect(page.url()).toMatch(/\/w\/[^/]+/);
  });

  await test.step('check new notebook date', async () => {
    await randomFreeUser.workspace.ellipsisSelector(0);
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const year = currentDate.getFullYear();
    const formattedDate = `Created: ${day} ${month} ${year}`;

    // checks menu has the notebook creation date
    await expect(async () => {
      expect(notebook.page.getByText(formattedDate)).toBeTruthy();
    }).toPass();

    // checks the menu closed by pressing esc
    await expect(async () => {
      await notebook.page.keyboard.press('Escape');
      await expect(notebook.page.getByText(formattedDate)).toBeHidden();
    }).toPass();
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
  test.slow();
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;
  await randomFreeUser.createAndNavNewNotebook();
  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);
  await randomFreeUserNotebook.updateNotebookTitle(notebookTitle);
  await randomFreeUserNotebook.duplicate();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await randomFreeUserPage.waitForTimeout(Timeouts.redirectDelay);
  await randomFreeUserPage
    .getByTestId('segment-button-trigger-back-to-home')
    .click();
  await expect(
    randomFreeUserPage.getByText(`Copy of ${notebookTitle}`)
  ).toBeVisible();
});

test('duplicate inside notebook with multiple workspaces', async ({
  randomFreeUser,
}) => {
  test.slow();
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;

  const NewWorkspaceName = `New Workspace${Math.round(Math.random() * 10000)}`;
  let notebookUrl = '';
  let newWorkspaceURL = '';
  await randomFreeUser.createAndNavNewNotebook();

  await test.step('create new workspace', async () => {
    notebookUrl = randomFreeUserPage.url();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await randomFreeUserPage.waitForTimeout(Timeouts.redirectDelay);
    await randomFreeUserPage
      .getByTestId('segment-button-trigger-back-to-home')
      .click();
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
    const notebookTitle =
      currentDate.toString() + Math.round(Math.random() * 10000);
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
  test.slow();
  const { page: randomFreeUserPage, notebook: randomFreeUserNotebook } =
    randomFreeUser;
  const {
    page: testUserPage,
    notebook: testUserNotebook,
    workspace: testUserWorkspace,
  } = testUser;
  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);
  let notebookURL = '';

  await test.step('create team workspace, so you can invite collaborators', async () => {
    await testUserPage.goto('/');
    await testUserWorkspace.newWorkspaceWithPlan('plus');
    await testUserWorkspace.clickNewPadButton();
  });

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

test('check collaborator duplicate multiple workspaces', async ({
  testUser,
  anotherTestUser,
}) => {
  test.slow();
  const {
    page: randomFreeUserPage,
    notebook: randomFreeUserNotebook,
    workspace: randomFreeUserWorkspace,
  } = anotherTestUser;
  const {
    page: testUserPage,
    notebook: testUserNotebook,
    workspace: testUserWorkspace,
  } = testUser;
  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);
  let notebookURL = '';
  let newWorkspaceURL = '';
  const NewWorkspaceName = `New workspace${Math.round(Math.random() * 10000)}`;

  await test.step('create team workspace, so you can invite collaborators', async () => {
    await testUserPage.goto('/');
    await testUserWorkspace.newWorkspaceWithPlan('plus');
    await testUserWorkspace.clickNewPadButton();
  });

  await test.step('create notebook and invite [randomFreeUser] to collaborate', async () => {
    await testUserNotebook.updateNotebookTitle(notebookTitle);
    notebookURL = testUserPage.url();
    await testUserNotebook.inviteUser(anotherTestUser.email, 'editor');
  });

  await test.step('[randomFreeUser] create new workspace to duplicate shared notebook', async () => {
    await anotherTestUser.goToWorkspace();
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

test('reader can load notebook where the first tab is hidden @tabs', async ({
  testUser,
  unregisteredUser,
}) => {
  const { notebook: testUserNotebook } = testUser;
  const { page: unregisteredUserPage, notebook: unregisteredUserNotebook } =
    unregisteredUser;
  let sharedPageLocation: string;
  const notebookName = 'Check Redirects';

  await test.step('publish notebook with first tab hidden', async () => {
    await testUserNotebook.updateNotebookTitle(notebookName);
    await testUserNotebook.createTabs(['Tab 2', 'Tab 3']);
    expect(await testUserNotebook.getTabNames()).toEqual([
      'New Tab',
      'Tab 2',
      'Tab 3',
    ]);
    await testUserNotebook.hideTab('New Tab');
    sharedPageLocation = await testUser.notebook.publishNotebook();
  });

  await test.step('[unregisteredUser] can navigate to notebook with first tab hidden', async () => {
    await unregisteredUserPage.goto(sharedPageLocation!);
    await unregisteredUserNotebook.waitForEditorToLoad();
    await unregisteredUserNotebook.checkNotebookTitle(notebookName);
    await unregisteredUserPage.getByText('Try Decipad').waitFor();
    expect(await unregisteredUserNotebook.getTabNames()).toEqual([
      'Tab 2',
      'Tab 3',
    ]);
    await unregisteredUserPage.reload();
    await unregisteredUserNotebook.checkNotebookTitle(notebookName);
  });
});

test('reader can load notebook with link to deleted tab @tabs', async ({
  testUser,
  unregisteredUser,
}) => {
  const { page: testUserPage, notebook: testUserNotebook } = testUser;
  const { page: unregisteredUserPage, notebook: unregisteredUserNotebook } =
    unregisteredUser;
  let notebookDeletedTabLink: string;
  const notebookName = 'Check deleted tab redirects';

  await test.step('publish notebook with first tab hidden', async () => {
    await testUserNotebook.updateNotebookTitle(notebookName);
    await testUserNotebook.createTabs(['Tab 2', 'Tab 3']);
    expect(await testUserNotebook.getTabNames()).toEqual([
      'New Tab',
      'Tab 2',
      'Tab 3',
    ]);
    await testUserNotebook.selectTab('Tab 2');
    // publish and get link from tab that will be deleted
    notebookDeletedTabLink = testUserPage.url();
    await testUserNotebook.deleteTab('Tab 2');
    await testUser.notebook.publishNotebook();
  });

  await test.step('[unregisteredUser] can navigate to notebook link of deleted tab', async () => {
    await unregisteredUserPage.goto(notebookDeletedTabLink!);
    await unregisteredUserNotebook.waitForEditorToLoad();
    await unregisteredUserNotebook.checkNotebookTitle(notebookName);
    await unregisteredUserPage.getByText('Try Decipad').waitFor();
    expect(await unregisteredUserNotebook.getTabNames()).toEqual([
      'New Tab',
      'Tab 3',
    ]);
    await unregisteredUserPage.reload();
    await unregisteredUserNotebook.checkNotebookTitle(notebookName);
  });
});

test("checks big notebooks don't have issues publishing", async ({
  testUser,
}) => {
  test.slow();
  const { page, notebook } = testUser;
  await testUser.importNotebook(oldNotebookJson);
  await testUser.notebook.waitForEditorToLoad();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.chartsDelay + Timeouts.computerDelay * 3);
  await notebook.publishNotebook();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.computerDelay);
  await expect(
    page.getByTestId('publish-changes'),
    'Publish changes button is visible after publishing notebook for the first time and no edits'
  ).toBeHidden();
  await expect(
    notebook.republishNotification,
    'Publish changes notification is visible after publishing notebook for the first time and no edits'
  ).toBeHidden();
  await page.reload();
  await notebook.waitForEditorToLoad();
  await expect(
    page.getByTestId('publish-changes'),
    'Publish changes button is visible after publishing notebook for the first time and no edits'
  ).toBeHidden();
  await expect(
    notebook.republishNotification,
    'Publish changes notification is visible after publishing notebook for the first time and no edits'
  ).toBeHidden();
});

test("checks big notebooks don't get stuck with publish changes notification", async ({
  testUser,
}) => {
  const { page, notebook } = testUser;

  await test.step('publish notebook with old style json', async () => {
    await testUser.importNotebook(oldNotebookJson);
    await testUser.notebook.waitForEditorToLoad();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay + Timeouts.computerDelay);
    await notebook.publishNotebook();
  });

  await test.step('add a new tab and publish changes', async () => {
    await notebook.createTab();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await expect(
      page.getByTestId('publish-changes'),
      'Publish changes button isnt visible after edits'
    ).toBeVisible();
    await expect(
      notebook.republishNotification,
      'Publish changes notification isnt visible after edits'
    ).toBeVisible();

    await page.getByTestId('publish-changes').click();

    await expect(
      page.getByTestId('publish-changes'),
      'Publish changes button is visible after publishing notebook for the first time and no edits'
    ).toBeHidden();
    await expect(
      notebook.republishNotification,
      'Publish changes notification is visible after publishing notebook for the first time and no edits'
    ).toBeHidden();
  });

  await test.step('check publish changes notification doesnt persist after refresh', async () => {
    await page.reload();
    await notebook.waitForEditorToLoad();

    await expect(
      page.getByTestId('publish-changes'),
      'Publish changes button is visible after publishing notebook for the first time and no edits'
    ).toBeHidden();
    await expect(
      notebook.republishNotification,
      'Publish changes notification is visible after publishing notebook for the first time and no edits'
    ).toBeHidden();
  });
});

test('Premium Feature - Allow duplicate, prevent users from duplicating', async ({
  testUser,
  anotherTestUser,
}) => {
  let notebookLink: string | undefined;

  await test.step('Create and publish notebook', async () => {
    await testUser.goToWorkspace();
    await testUser.workspace.newWorkspace('@n1n.co team');

    await testUser.createNewNotebook();
    await testUser.notebook.publishPrivateURL();

    notebookLink = testUser.page.url();

    await expect(
      testUser.page.locator('text="Allow readers to duplicate"')
    ).toBeVisible();
  });

  await test.step('Logged in user cannot duplicate', async () => {
    await anotherTestUser.page.goto(notebookLink!);
    await expect(anotherTestUser.notebook.duplicateNotebook).toBeHidden();
  });

  await test.step('Original user can go back and allow duplication', async () => {
    await testUser.page.locator('text="Allow readers to duplicate"').click();
  });

  await test.step('Logged in user can now duplicate', async () => {
    await anotherTestUser.page.reload();
    await expect(
      anotherTestUser.notebook.topRightDuplicateNotebook
    ).toBeVisible();

    await anotherTestUser.notebook.topRightDuplicateNotebook.click();

    await expect(
      anotherTestUser.notebook.page.getByRole('button', { name: 'Share ' })
    ).toBeVisible();
  });
});
