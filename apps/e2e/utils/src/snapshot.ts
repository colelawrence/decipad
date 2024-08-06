import percySnapshot from '@percy/playwright';
import type { Page } from '@playwright/test';

const PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS = 10_000;

const snapshotsTaken = new Set<string>();

export const snapshot = async (
  page: Page,
  name: string,
  options: { mobile?: boolean; midSize?: boolean } = {
    mobile: false,
    midSize: false,
  }
): Promise<void> => {
  if (!process.env.PERCY_TOKEN || snapshotsTaken.has(name)) {
    return;
  }
  snapshotsTaken.add(name);
  await page.waitForLoadState('load');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS);
  await page.evaluate(() => document.fonts.ready);

  const initialViewportSize = page.viewportSize()!;

  for (const width of [options.mobile && 375, options.midSize && 768, 1380]) {
    if (!width) continue;

    await page.setViewportSize({
      ...initialViewportSize,
      width,
    });

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS);

    try {
      await percySnapshot(page, name, {
        widths: [width],
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('error taking snapshot:', err);
    }
  }

  await page.setViewportSize(initialViewportSize);

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(PAGE_SETTLE_TIMEOUT_BEFORE_SNAPSHOT_MS);
};
