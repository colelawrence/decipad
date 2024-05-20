/* eslint-disable playwright/no-skipped-test */
import { expect, test } from './manager/decipad-tests';

let teamWorkspaceURL: string;
test.beforeAll(async ({ testUser }) => {
  await testUser.goToWorkspace();
  await testUser.workspace.newWorkspaceWithPlan('plus');
  teamWorkspaceURL = testUser.page.url();
});

test('check notebooks stay private for other logged in users', async ({
  anotherTestUser,
  testUser,
}) => {
  await testUser.page.goto(teamWorkspaceURL);
  await testUser.workspace.createNewNotebook();
  await testUser.notebook.closeSidebar();
  await testUser.notebook.waitForEditorToLoad();
  const notebookURL = testUser.page.url();

  await test.step('Check user cannot access notebook they do not have permission to - Show NOT FOUND error, as showing forbidden could be security problem', async () => {
    await anotherTestUser.page.goto(notebookURL);
    await expect(
      anotherTestUser.page.getByText('The requested URL was not found')
    ).toBeVisible();
    await anotherTestUser.page.close();
  });
});

test('check inviting readers stay in reading mode', async ({
  testUser,
  anotherTestUser,
}) => {
  await testUser.page.goto(teamWorkspaceURL);
  await testUser.workspace.createNewNotebook();
  await testUser.notebook.closeSidebar();
  await testUser.notebook.waitForEditorToLoad();
  const notebookURL = testUser.page.url();

  await test.step('Invite another user to notepad with readonly', async () => {
    await testUser.notebook.openPublishingSidebar();
    await testUser.page
      .getByPlaceholder('Enter email address')
      .fill(anotherTestUser.email);
    await testUser.page.keyboard.press('Tab');
    await testUser.page.keyboard.press('Enter');
    await testUser.page
      .getByText('Notebook readerCan read and interact only with this notebook')
      .click();
    await testUser.page.getByTestId('send-invitation').click();

    // check test user two has read permissions only
    await anotherTestUser.page.goto(notebookURL);
    await expect(
      anotherTestUser.page.getByText('You have view-only access')
    ).toBeVisible();

    const titleElementPage1 = testUser.page.getByTestId('editor-title');
    const titleElementPage2 = anotherTestUser.page.getByTestId('editor-title');
    const page1Text = await titleElementPage1.textContent();
    const page2Text = await titleElementPage2.textContent();
    expect(page1Text).toEqual(page2Text);

    expect(
      await anotherTestUser.page
        .getByTestId('editor-title')
        .evaluate((e: HTMLElement) => e.isContentEditable)
    ).toBeFalsy();
  });
});

test('check invited collaborators can edit notebook', async ({
  testUser,
  anotherTestUser,
}) => {
  await testUser.page.goto(teamWorkspaceURL);
  await testUser.workspace.createNewNotebook();
  await testUser.notebook.closeSidebar();
  await testUser.notebook.waitForEditorToLoad();
  const notebookURL = testUser.page.url();

  await test.step('Invite another user to notepad as contributor', async () => {
    await testUser.notebook.openPublishingSidebar();
    await testUser.page
      .getByPlaceholder('Enter email address')
      .fill(anotherTestUser.email);
    await testUser.page.getByPlaceholder('Enter email address').focus();
    await testUser.page.getByTestId('send-invitation').click();

    await anotherTestUser.page.goto(notebookURL);
    await anotherTestUser.aiAssistant.closePannel();
    await anotherTestUser.notebook.waitForEditorToLoad();

    expect(
      await anotherTestUser.page
        .getByTestId('editor-title')
        .evaluate((e: HTMLElement) => e.isContentEditable)
    ).toBeTruthy();
  });

  await test.step('check author can see contributor changes', async () => {
    await anotherTestUser.notebook.focusOnBody();
    await anotherTestUser.notebook.addParagraph(
      'Hello, World!, Sent from contributor!'
    );

    await expect(
      testUser.page.getByText('Hello, World!, Sent from contributor!')
    ).toBeVisible();

    const titleElementPage1 = testUser.page.getByTestId('editor-title');
    const titleElementPage2 = anotherTestUser.page.getByTestId('editor-title');
    const page1Text = await titleElementPage1.textContent();
    const page2Text = await titleElementPage2.textContent();

    expect(page1Text).toEqual(page2Text);

    expect(
      await anotherTestUser.page
        .getByTestId('editor-title')
        .evaluate((e: HTMLElement) => e.isContentEditable)
    ).toBeTruthy();
  });
});
