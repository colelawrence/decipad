import type { Page } from '@playwright/test';
import { expect, test } from './manager/decipad-tests';
import notebookSource from '../__fixtures__/004-testing-edit-permissions.json';

export const typeTest = (currentPage: Page, input: string) =>
  test.step('Trying to add text to formulas', async () => {
    await currentPage.getByTestId('code-line').type(input);
  });

test('Loading reference notebook', async ({
  testUser,
  anotherRandomFreeUser,
  unregisteredUser,
}) => {
  const notebookId = await testUser.importNotebook(notebookSource);
  await testUser.notebook.waitForEditorToLoad();
  await test.step('Waiting for editor to be ready', async () => {
    expect(
      testUser.page.getByTestId('[data-testid="editor-table"]')
    ).toBeDefined();
  });

  await test.step('Modifying table formula as notebook owner', async () => {
    await testUser.page.getByTestId('code-line').click();
    await testUser.page.getByTestId('code-line').fill('A + 2 + 5');
    await expect(testUser.page.getByText('8')).toBeVisible();
  });

  await test.step('Publish notebook and navigate to it as a random user', async () => {
    await testUser.notebook.publishNotebook();
    await anotherRandomFreeUser.navigateToNotebook(notebookId);
    await anotherRandomFreeUser.notebook.waitForEditorToLoad();
  });

  await test.step('Random user tries to edit', async () => {
    await typeTest(anotherRandomFreeUser.page, 'A');
    await expect(anotherRandomFreeUser.page.getByText('8')).toBeVisible();
  });

  await test.step('Incognito user tries to edit', async () => {
    await unregisteredUser.navigateToNotebook(notebookId);
    await unregisteredUser.notebook.waitForEditorToLoad();
    await typeTest(unregisteredUser.page, 'A');
    await expect(unregisteredUser.page.getByText('8')).toBeVisible();
  });
});
