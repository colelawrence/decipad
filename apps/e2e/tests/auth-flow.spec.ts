import { expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Home';
import { snapshot, Timeouts, withTestUser } from '../utils/src';

test.describe('Authentication flow', () => {
  test.beforeEach(async ({ page }) => {
    await setUp(page);
  });

  test('Should display welcome message', async ({ page }) => {
    await page.goto('/');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.redirectDelay);
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
    await page.click('text=/submit/i');
  });

  test('should redirect to workspace if authenticated', async ({
    page,
    context,
  }) => {
    await setUp(page);
    await withTestUser({ page, context });
    await page.goto('/');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });
});
