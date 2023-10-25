import { test as setup } from '@playwright/test';
import { app, auth } from '@decipad/backend-config';
import { withTestUser } from '.';
import { genericTestEmail } from './users';
import { STORAGE_STATE } from '../../playwright.config';

setup('login test user', async ({ page, context }) => {
  context.clearCookies();
  const loginUrl = `${app().urlBase}/api/auth/${
    auth().testUserSecret
  }?email=${encodeURIComponent(genericTestEmail())}`;
  await withTestUser({
    page,
    context,
    email: genericTestEmail(),
  });
  await page.goto(loginUrl);
  await page.waitForURL(/\/w\//);
  await page.context().storageState({ path: STORAGE_STATE });
});
