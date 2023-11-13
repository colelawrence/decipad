import { expect, test, Page } from './manager/decipad-tests';
import { snapshot, Timeouts } from '../utils/src';
import { app } from '@decipad/backend-config';

test('check auth flows @auth', async ({ unregisteredUser }) => {
  const { page } = unregisteredUser;
  const testEmail = 'johndoe123@gmail.com';
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

test('redirect to workspace if authenticated and can logout @auth', async ({
  testUser,
}) => {
  const { page } = testUser;
  await page.goto('/');
  await expect(page.getByTestId('dashboard')).toBeVisible();
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
