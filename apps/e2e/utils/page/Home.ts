import { app } from '@decipad/config';
import { Page } from 'playwright';

export const signOut = async (page: Page) => {
  await page.goto(`${app().urlBase}/api/auth/signout`);
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
};

export async function setUp(page: Page) {
  await signOut(page);
  await Promise.all([page.goto('/'), page.waitForEvent('load')]);
}
