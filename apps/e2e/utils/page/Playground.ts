import { Page } from '@playwright/test';
import { URL } from 'url';

export function isOnPlayground(page: Page | URL): boolean {
  const url = page instanceof URL ? page : new URL(page.url());
  return url.pathname.match(/playground/) !== null;
}

export async function navigateToPlayground(page: Page) {
  if (!isOnPlayground(page as Page)) {
    await page.goto('/playground');
    if (!isOnPlayground(page as Page)) {
      await page.waitForNavigation({
        url: isOnPlayground,
      });
    }
  }
}
