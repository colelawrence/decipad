import { expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Home';
import { withTestUser } from '../utils/src';

test.describe('Workspace flows', () => {
  test.beforeEach(async ({ page, context }) => {
    await setUp(page);
    await withTestUser({ page, context });
    await page.goto('/');
    await page.waitForSelector('text=/Workspace/i');
  });

  test('You can list published notebooks', async ({ page }) => {
    const link = await page
      .locator('main a[href] >> nth=1')
      .getAttribute('href');
    expect(typeof link).toBe('string');
    await page.goto(link || '');
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    const workspaceLink = await page
      .locator('header a[href] >> nth=0')
      .getAttribute('href');
    await page.goto(workspaceLink || '');
    await page.getByRole('link', { name: 'Globe Published' }).click();
    const archivedDocuments = await page.locator('main a[href]').count();
    // document plus cta link
    expect(archivedDocuments).toBe(2);
  });

  test('Archive & delete a notebook', async ({ page }) => {
    await page.click('main div[type=button] >> nth=0'); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Archive")');
    await page.click('aside nav > ul > li a span:has-text("Archived")');
    await page.click('main div[type=button] >> nth=0'); // click first ellipsis
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
