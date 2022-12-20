import percySnapshot from '@percy/playwright';
import { Page } from 'playwright-core';

const PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS = 2_000;

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
  await page.waitForTimeout(PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS);

  try {
    await percySnapshot(page, name, {
      widths: [options.mobile && 375, 1280].filter((n): n is number =>
        Number.isInteger(n)
      ),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error taking snapshot:', err);
  }
};
