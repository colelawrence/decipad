import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { clickNewPadButton, duplicatePad } from '../utils/page/Workspace';

test.describe('check notebook duplicate stays in the same workspace', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test('create new workspace', async () => {
    await page.getByTestId('go-to-workspace').click();
    await page.getByTestId('workspace-selector-button').click();
    await page.getByTestId('create-workspace-button').click();
    await page.getByPlaceholder('Team workspace').click();
    await page.getByPlaceholder('Team workspace').fill('NewWorkspace');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      'Welcome toNewWorkspace'
    );
  });

  test('new notebook', async () => {
    await clickNewPadButton(page);
    await waitForEditorToLoad(page);
    await page.getByTestId('go-to-workspace').click();
    expect(page.url()).toMatch(/\/w\/[^/]+/);
  });

  test('duplicate notebook', async () => {
    await duplicatePad(page, 0);
    await expect(page.getByText('Copy of')).toBeVisible();
  });
});
