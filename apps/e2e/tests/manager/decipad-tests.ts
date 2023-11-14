import { test as base } from '@playwright/test';
import { User } from './test-users';
import { genericTestEmail, genericTestEmail2 } from '../../utils/src/users';
import { STORAGE_STATE, STORAGE_STATE2 } from '../../playwright.config';

type DecipadFixtures = {
  premiumUser: User;
  testUser: User;
  unregisteredUser: User;
  randomFreeUser: User;
  randomPremiumUser: User;
  anotherRandomFreeUser: User;
  anotherTestUser: User;
};

export const test = base.extend<DecipadFixtures>({
  premiumUser: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const adminPage = new User(await context.newPage());
    await use(adminPage);
    await context.close();
  },
  testUser: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const userPage = new User(await context.newPage());
    userPage.email = genericTestEmail();
    await userPage.createAndNavNewNotebook();
    await use(userPage);
    await context.close();
  },
  anotherTestUser: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE2 });
    const userPage = new User(await context.newPage());
    userPage.email = genericTestEmail2();
    await use(userPage);
    await context.close();
  },
  randomFreeUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    const userPage = new User(await context.newPage());
    await userPage.setupRandomFreeUser();
    await use(userPage);
    await context.close();
  },
  anotherRandomFreeUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    const userPage = new User(await context.newPage());
    await userPage.setupRandomFreeUser();
    await use(userPage);
    await context.close();
  },
  randomPremiumUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    const userPage = new User(await context.newPage());
    await userPage.setupRandomPremiumUser();
    await use(userPage);
    await context.close();
  },
  unregisteredUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    await context.clearCookies();
    const userPage = new User(await context.newPage());
    await use(userPage);
    await context.close();
  },
});

export * from '@playwright/test';
