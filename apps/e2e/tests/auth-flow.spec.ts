import { BrowserContext, expect, Page, test } from '@playwright/test';
import { snapshot, withTestUser } from '../utils/src';

test.describe('check auth flows @auth', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('login flow', async () => {
    const testEmail = 'johndoe123@gmail.com';
    context.clearCookies();
    await Promise.all([page.goto('/'), page.waitForEvent('load')]);
    await expect(page.getByText('Welcome to Deci')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Terms of Service' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Privacy Policy' })
    ).toBeVisible();
    await expect(page.getByTestId('login-button')).toHaveAttribute('disabled');
    await snapshot(page as Page, 'Auth: Login Window');
    const emailField = page.getByPlaceholder('Enter your email');
    await emailField.fill(testEmail);
    await page.getByTestId('login-button').click();
    await expect(
      page.getByText(
        `Open the link sent to ${testEmail}. No email? Check spam folder.`
      )
    ).toBeVisible();
  });

  test('redirect to workspace if authenticated', async () => {
    await withTestUser({ page, context });
    await page.goto('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();
  });
});
