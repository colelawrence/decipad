import percySnapshot from '@percy/playwright';
import { Page } from 'playwright-core';

export const snapshot = async (page: Page, name: string): Promise<void> => {
  if (!process.env.PERCY_TOKEN) {
    return;
  }
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');

  return percySnapshot(page, name);
};
