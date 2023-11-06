import { test as base } from '@playwright/test';
import { Notebook } from './notebook';

type DecipadFixtures = {
  notebook: Notebook;
};

export const test = base.extend<DecipadFixtures>({
  notebook: async ({ page }, use) => {
    await use(new Notebook(page));
  },
});

export * from '@playwright/test';
