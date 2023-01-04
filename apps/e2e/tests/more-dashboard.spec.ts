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
    await page.waitForSelector('button:has-text("Start with new notebook")');
  });

  test('Create a workspace', async ({ page }) => {
    const avatarsInPage = await page.locator('[role=img]');
    expect(await avatarsInPage.count()).toBe(2);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByPlaceholder('My Workspace').click();
    await page.getByPlaceholder('My Workspace').fill('Wtf');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    const title = await page.getByText('Wtf');
    await expect(title).toBeVisible();
  });

  test('user can logout', async ({ page }) => {
    await page.click('aside button div[role=img] >> nth=1');
    await page.click('aside button:has-text("Log out")');
    const loginHeading = await page.getByRole('heading', {
      name: 'Log in to Decipad',
    });
    await expect(loginHeading).toBeVisible();
  });
});
