import percySnapshot from '@percy/playwright';
import { Page } from '@playwright/test';
import { Page as Page2 } from 'playwright';

const PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS = 10_000;

const snapshotsTaken = new Set<string>();

export const snapshot = async (
  page: Page,
  name: string,
  options = { mobile: false }
): Promise<void> => {
  if (!process.env.PERCY_TOKEN || snapshotsTaken.has(name)) {
    return;
  }
  snapshotsTaken.add(name);
  await page.waitForLoadState('networkidle');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS);
  await page.evaluate(() => document.fonts.ready);

  try {
    await percySnapshot(page as Page2, name, {
      // dont change the width, messes up screenshots
      widths: [options.mobile && 375, 1380].filter((n): n is number =>
        Number.isInteger(n)
      ),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error taking snapshot:', err);
  }
};
