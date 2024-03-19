import { expect, test } from './manager/decipad-tests';

test('workspace permissions', async ({
  testUser,
  randomFreeUser,
  anotherRandomFreeUser,
}) => {
  test.slow();

  let premiumWorkspaceId: string;
  await test.step('premium user is premium', async () => {
    await testUser.goToWorkspace();
    premiumWorkspaceId = (
      await testUser.workspace.newWorkspace('Premium Workspace@n1n.co')
    )
      .split('/')
      .at(-1)!;
    await testUser.page.reload();
  });

  await test.step('invite member and admin', async () => {
    await testUser.workspace.addWorkspaceMember(randomFreeUser.email);
    await testUser.workspace.addWorkspaceMember(
      anotherRandomFreeUser.email,
      'Admin'
    );
    await testUser.createAndNavNewNotebook(premiumWorkspaceId);
    await testUser.notebook.updateNotebookTitle('Test Notepad');
    await testUser.goToWorkspace(premiumWorkspaceId);
  });

  await test.step('standard member checks', async () => {
    await randomFreeUser.goToWorkspace(premiumWorkspaceId);
    await expect(
      randomFreeUser.page.getByTestId('manage-workspace-members')
    ).toBeHidden();

    await randomFreeUser.page.getByTestId('list-notebook-title').click();
    await randomFreeUser.notebook.waitForEditorToLoad();
    await randomFreeUser.notebook.checkNotebookTitle('Test Notepad');
    await expect(
      randomFreeUser.page.getByTestId('editor-title')
    ).toBeEditable();
    await expect(
      randomFreeUser.page.getByTestId('paragraph-content')
    ).toBeEditable();
  });

  await test.step('standard member checks', async () => {
    await anotherRandomFreeUser.goToWorkspace(premiumWorkspaceId);
    await anotherRandomFreeUser.workspace.openWorkspaceSettingsSection();
    await expect(
      anotherRandomFreeUser.page.getByTestId('manage-workspace-members')
    ).toBeVisible();

    await anotherRandomFreeUser.page.getByTestId('list-notebook-title').click();
    await anotherRandomFreeUser.notebook.waitForEditorToLoad();
    await anotherRandomFreeUser.notebook.checkNotebookTitle('Test Notepad');

    await expect(
      anotherRandomFreeUser.page.getByTestId('editor-title')
    ).toBeEditable();
    await expect(
      anotherRandomFreeUser.page.getByTestId('paragraph-content')
    ).toBeEditable();
  });
});
