/* eslint-disable import/no-extraneous-dependencies */
import { test as base } from '@playwright/test';
import { User } from './test-users';
import { genericTestEmail, genericTestEmail2 } from '../../utils/src/users';
import { STORAGE_STATE, STORAGE_STATE2 } from '../../playwright.config';

import type {
  PerformanceOptions,
  PlaywrightPerformance,
  PerformanceWorker,
} from 'playwright-performance';
import { playwrightPerformance } from 'playwright-performance';

type DecipadFixtures = {
  testUser: User;
  unregisteredUser: User;
  randomFreeUser: User;
  anotherRandomFreeUser: User;
  anotherTestUser: User;
};

export const test = base.extend<
  PlaywrightPerformance & DecipadFixtures,
  PerformanceOptions & PerformanceWorker
>({
  performance: playwrightPerformance.performance,
  performanceOptions: [{}, { scope: 'worker' }],
  worker: [playwrightPerformance.worker, { scope: 'worker', auto: true }],

  testUser: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const userPage = new User(context, await context.newPage());
    userPage.email = genericTestEmail();
    await userPage.createAndNavNewNotebook();
    await userPage.notebook.closeSidebar();
    await use(userPage);
    await context.close();
  },
  anotherTestUser: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE2 });
    const userPage = new User(context, await context.newPage());
    userPage.email = genericTestEmail2();
    await use(userPage);
    await context.close();
  },
  randomFreeUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    const userPage = new User(context, await context.newPage());
    await userPage.setupRandomFreeUser();
    await use(userPage);
    await context.close();
  },
  anotherRandomFreeUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    const userPage = new User(context, await context.newPage());
    await userPage.setupRandomFreeUser();
    await use(userPage);
    await context.close();
  },
  unregisteredUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    await context.clearCookies();
    const userPage = new User(context, await context.newPage());
    await use(userPage);
    await context.close();
  },
});

export * from '@playwright/test';
