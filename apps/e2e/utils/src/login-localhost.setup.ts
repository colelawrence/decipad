import { test as setup } from '@playwright/test';
import { withTestUser } from '.';
import { genericTestEmail, genericTestEmail2 } from './users';
import { STORAGE_STATE, STORAGE_STATE2 } from '../../playwright.config';
import { e2eFlags } from './feature-flags';

setup('Login user and save state', async ({ context, page }) => {
  // testUser
  await withTestUser({
    page,
    context,
    email: genericTestEmail(),
  });

  const flags = JSON.stringify(e2eFlags);

  await page.evaluate(
    (f) => localStorage.setItem('deciFeatureFlags', f),
    flags
  );
  await page.context().storageState({ path: STORAGE_STATE });

  // anotherTestUser
  await withTestUser({
    page,
    context,
    email: genericTestEmail2(),
  });

  await page.evaluate(
    (f) => localStorage.setItem('deciFeatureFlags', f),
    flags
  );
  await page.context().storageState({ path: STORAGE_STATE2 });

  await page.close();
  await context.close();
});
