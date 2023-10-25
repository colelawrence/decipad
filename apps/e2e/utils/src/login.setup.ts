import { test as setup } from '@playwright/test';
import { withTestUser } from '.';
import { genericTestEmail } from './users';
import { STORAGE_STATE } from '../../playwright.config';

setup('Login user and save state', async ({ context, page }) => {
  await withTestUser({
    page,
    context,
    email: genericTestEmail(),
  });

  await page.context().storageState({ path: STORAGE_STATE });
});
