import { expect, test } from '@playwright/test';
import { app } from '@decipad/backend-config';
import { setUp } from '../utils/page/Home';
import { ellipsisSelector } from '../utils/page/Workspace';
import { withTestUser, Timeouts } from '../utils/src';

test.describe('Workspace flows', () => {
  test.beforeEach(async ({ page, context }) => {
    await setUp(page);
    await withTestUser({ page, context });
    await page.goto('/');
    await page.waitForSelector('text=/Workspace/i', {
      timeout: Timeouts.maxSelectorWaitTime,
    });
  });

  test('Archive & delete a notebook', async ({ page }) => {
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Archive")');
    await page.click('aside nav > ul > li a span:has-text("Archived")');
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Delete")');
    await expect(page.getByText('No documents to list')).toBeVisible();
  });

  test('Create a workspace', async ({ page }) => {
    await page.getByTestId('workspace-selector-button').click();
    await page.getByTestId('create-workspace-button').click();
    await page.getByPlaceholder('Team workspace').click();
    await page.getByPlaceholder('Team workspace').fill('Wtf');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      'Welcome toWtf'
    );
  });

  test('user can logout', async ({ page }) => {
    await page.getByTestId('account-settings-button').click();
    await page.getByTestId('logout-link').click();
    // Checking link rather than render of sign out page since that can timeout
    // Instead, check if it redirects to the right link and wait
    // To make sure it doesn't redirect to the workspace
    await expect(page).toHaveURL(`${app().urlBase}/w`);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.redirectDelay);
    await expect(page).toHaveURL(`${app().urlBase}/w`);
  });
});
