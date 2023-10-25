import { BrowserContext, Page, expect, test } from '@playwright/test';
import { ellipsisSelector } from '../utils/page/Workspace';
import { withTestUser } from '../utils/src';

test.describe('Workspace flows', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await withTestUser({ page, context });
  });

  test('Archive & delete a notebook', async () => {
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Archive")');
    await page.click('aside nav > ul > li a span:has-text("Archived")');
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Delete")');
    await expect(page.getByText('No documents to list')).toBeVisible();
  });

  test('Create a workspace', async () => {
    await page.getByTestId('workspace-selector-button').click();
    await page.getByTestId('create-workspace-button').click();
    await page.getByPlaceholder('Team workspace').click();
    await page.getByPlaceholder('Team workspace').fill('Wtf');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      'Welcome toWtf'
    );
  });

  test('Update name in the account settings modal', async () => {
    await page.getByTestId('account-settings-button').click();
    await page.getByTestId('user-name').fill('Joe Doe');
    await page.getByTestId('btn-create-modal').click();

    await expect(page.locator('[title="Joe Doe"]')).toHaveText('Joe Doe');

    await page.getByTestId('account-settings-button').click();

    await expect(page.getByTestId('user-name')).toHaveValue('Joe Doe');
  });

  test('Update username in the account settings modal', async () => {
    const currentDate = Date.now();
    await page.getByTestId('user-username').fill(`joedoe${currentDate}`);
    await page.getByTestId('btn-create-modal').click();
    await page.getByTestId('account-settings-button').click();

    await expect(page.getByTestId('user-username')).toHaveValue(
      `@joedoe${currentDate}`
    );
  });
});
