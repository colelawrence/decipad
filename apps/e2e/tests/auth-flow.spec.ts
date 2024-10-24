import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';
import { snapshot, Timeouts } from '../utils/src';
import { app } from '@decipad/backend-config';

test('check auth flows @auth @snapshot', async ({ unregisteredUser }) => {
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
  // checking link rather than render of sign out page since that can timeout
  // Instead, check if it redirects to the right link and wait
  // To make sure it doesn't redirect to the workspace
  await expect(page).toHaveURL(`${app().urlBase}/w`);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.redirectDelay);
  await expect(page).toHaveURL(`${app().urlBase}/w`);
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip('check redirect from signup from try decipad @auth', async ({
  testUser,
  unregisteredUser,
}) => {
  const { notebook: notebookTestUser } = testUser;
  let notebookWithTabs: string;
  const { page: pageUnregisteredUser, notebook: notebookUnregisteredUser } =
    unregisteredUser;
  const textFirstTab = 'paragraph first tab';
  const textSecondTab = 'paragraph second tab';
  const notebookTitle = 'Check try Decipad';

  await test.step('publish second tab of new notebook', async () => {
    await testUser.createAndNavNewNotebook();
    await notebookTestUser.updateNotebookTitle(notebookTitle);
    await notebookTestUser.addParagraph(textFirstTab);
    await notebookTestUser.createTab('second tab');
    await notebookTestUser.addParagraph(textSecondTab);
    notebookWithTabs = await notebookTestUser.publishNotebook();
  });

  await test.step('[unregisteredUser] visit published second tab and try decipad', async () => {
    await pageUnregisteredUser.goto(notebookWithTabs);

    // check shared publish link shows correct tab
    await expect(
      notebookUnregisteredUser.notebookParagraph.getByText(textSecondTab)
    ).toBeVisible();

    await unregisteredUser.tryDecipadCreateAccount();
    await notebookUnregisteredUser.checkNotebookTitle(notebookTitle);

    // check sign in redirect to correct tab
    await expect(
      notebookUnregisteredUser.notebookParagraph.getByText(textSecondTab)
    ).toBeVisible();
  });
});
