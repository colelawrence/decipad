import { test as setup } from '@playwright/test';
import { withTestUser } from '.';
import { genericTestEmail, genericTestEmail2 } from './users';
import { STORAGE_STATE, STORAGE_STATE2 } from '../../playwright.config';

setup('Login user and save state', async ({ context, page }) => {
  // testUser
  await withTestUser({
    page,
    context,
    email: genericTestEmail(),
  });

  await page.context().storageState({ path: STORAGE_STATE });

  // anotherTestUser
  await withTestUser({
    page,
    context,
    email: genericTestEmail2(),
  });

  await page.context().storageState({ path: STORAGE_STATE2 });
});
