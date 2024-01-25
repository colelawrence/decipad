import { expect, test } from './manager/decipad-tests';

test('workspace permissions', async ({
  premiumUser,
  randomFreeUser,
  anotherRandomFreeUser,
}) => {
  test.slow();

  let premiumWorkspaceId: string;
  await test.step('premium user is premium', async () => {
    await premiumUser.goToWorkspace();
    premiumWorkspaceId = (
      await premiumUser.workspace.newWorkspace('Premium Workspace@n1n.co')
    )
      .split('/')
      .at(-1)!;
    await premiumUser.page.reload();
  });

  await test.step('invite member and admin', async () => {
    await premiumUser.workspace.addWorkspaceMember(randomFreeUser.email);
    await premiumUser.workspace.addWorkspaceMember(
      anotherRandomFreeUser.email,
      'Admin'
    );
    await premiumUser.createAndNavNewNotebook(premiumWorkspaceId);
    await premiumUser.notebook.updateNotebookTitle('Test Notepad');
    await premiumUser.goToWorkspace(premiumWorkspaceId);
  });

  await test.step('standard member checks', async () => {
    await randomFreeUser.goToWorkspace(premiumWorkspaceId);
    await expect(
      randomFreeUser.page.getByTestId('manage-workspace-members')
    ).toBeHidden();

    await randomFreeUser.page.getByTestId('list-notebook-title').click();
    await expect(randomFreeUser.page.getByText('Test Notepad')).toBeVisible();
    await expect(
      randomFreeUser.page.getByTestId('editor-title')
    ).toBeEditable();
    await expect(
      randomFreeUser.page.getByTestId('paragraph-content')
    ).toBeEditable();
  });

  await test.step('standard member checks', async () => {
    await anotherRandomFreeUser.goToWorkspace(premiumWorkspaceId);
    await expect(
      anotherRandomFreeUser.page.getByTestId('manage-workspace-members')
    ).toBeVisible();

    await anotherRandomFreeUser.page.getByTestId('list-notebook-title').click();
    await expect(
      anotherRandomFreeUser.page.getByText('Test Notepad')
    ).toBeVisible();
    await expect(
      anotherRandomFreeUser.page.getByTestId('editor-title')
    ).toBeEditable();
    await expect(
      anotherRandomFreeUser.page.getByTestId('paragraph-content')
    ).toBeEditable();
  });
});
