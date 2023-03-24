import { expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Home';
import { ellipsisSelector } from '../utils/page/Workspace';
import { withTestUser } from '../utils/src';

test.describe('Workspace flows', () => {
  test.beforeEach(async ({ page, context }) => {
    await setUp(page);
    await withTestUser({ page, context });
    await page.goto('/');
    await page.waitForSelector('text=/Workspace/i');
  });

  test('Archive & delete a notebook', async ({ page }) => {
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Archive")');
    await page.click('aside nav > ul > li a span:has-text("Archived")');
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Delete")');
    await expect(
      page.locator('button:has-text("Start with new notebook")')
    ).toBeVisible();
  });

  test('Create a workspace', async ({ page }) => {
    await expect(page.locator('[role=img]')).toHaveCount(2);
    await page.locator('[data-test-id="create-workspace-button"]').click();
    await page.getByPlaceholder('My Workspace').click();
    await page.getByPlaceholder('My Workspace').fill('Wtf');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByText('Wtf')).toBeVisible();
  });

  test('user can logout', async ({ page }) => {
    await page.click('aside button div[role=img] >> nth=1');
    await page.click('aside button:has-text("Log out")');
    await expect(
      page.getByRole('heading', {
        name: 'Log in to Decipad',
      })
    ).toBeVisible();
  });
});
