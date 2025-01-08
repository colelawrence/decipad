import percySnapshot from '@percy/playwright';
import type { Page } from '@playwright/test';

const snapshotsTaken = new Set<string>();

export const snapshot = async (
  page: Page,
  name: string,
  options?: { mobile?: boolean; midSize?: boolean }
): Promise<void> => {
  if (!process.env.PERCY_TOKEN || snapshotsTaken.has(name)) {
    return;
  }
  snapshotsTaken.add(name);

  // Wait for the page to stabilize
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(5_000);

  try {
    await percySnapshot(page, name, {
      widths: [
        1380,
        options?.mobile != null ? 768 : undefined,
        options?.midSize != null ? 375 : undefined,
      ].filter((i): i is number => i != null),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error taking snapshot:', err);
  }
};
