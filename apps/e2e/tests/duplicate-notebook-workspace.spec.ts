import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { clickNewPadButton, duplicatePad } from '../utils/page/Workspace';
import { getWorkspaces } from '../utils/src';

test.describe('check notebook duplicate stays in the same workspace', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  const NewWorkspaceName = 'NewWorkspace';
  let originalWorkspace: string | undefined;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
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
