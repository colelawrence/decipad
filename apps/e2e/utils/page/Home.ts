import { app } from '@decipad/backend-config';
import { Page } from '@playwright/test';

export const signOut = async (page: Page) => {
  await page.goto(`${app().urlBase}/api/auth/signout`);
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
};
