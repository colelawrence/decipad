import percySnapshot from '@percy/playwright';
import { Page } from 'playwright-core';

export const snapshot = async (
  page: Page,
  name: string,
  options = { mobile: false }
): Promise<void> => {
  if (!process.env.PERCY_TOKEN) {
    return;
  }
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');

  return percySnapshot(page, name, {
    widths: [options.mobile && 375, 1280].filter((n): n is number =>
      Number.isInteger(n)
    ),
  });
};
