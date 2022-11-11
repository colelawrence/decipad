import { expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Home';
import { snapshot, withTestUser } from '../utils/src';

test.describe('Authentication flow', () => {
  test.beforeEach(async ({ page }) => {
    await setUp(page);
  });

  test('Should display welcome message', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=/make/i');
    await snapshot(page as Page, 'Auth: Login Window');
  });

  test('should allow the user to type their email for login', async ({
    page,
  }) => {
    await page.click('text=/continue/i');
    await page.type('input', 'johndoe123@gmail.com');
    const inputValue = await page.inputValue('input');
    expect(inputValue).toBe('johndoe123@gmail.com');
  });

  test('should show confirmation email on login attempt', async ({ page }) => {
    await page.click('text=/continue/i');
    await page.type('input', 'johndoe123@gmail.com');
    page.click('text=/submit/i');
    expect(await page.waitForSelector('text=/check.+email/i')).not.toBe(null);
    await snapshot(page as Page, 'Auth: Magic Link Email Sent');
  });

  test('should redirect to workspace if authenticated', async ({
    page,
    context,
  }) => {
    await setUp(page);
    await withTestUser({ page, context });
    await page.goto('/');
    await page.waitForSelector('text=/Workspace/i');
  });
});
