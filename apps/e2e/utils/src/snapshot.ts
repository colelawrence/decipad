// import percySnapshot from '@percy/playwright';
import type { Page } from '@playwright/test';

const _snapshotsTaken = new Set<string>();

export const snapshot = async (
  page: Page,
  name: string,
  _options?: { mobile?: boolean; midSize?: boolean }
): Promise<void> => {
  // DISABLED: Percy snapshot functionality is disabled
  // eslint-disable-next-line no-console
  console.log(
    `[DISABLED] Snapshot "${name}" would have been taken (Percy disabled)`
  );

  // Original Percy code (commented out):
  // if (!process.env.PERCY_TOKEN || _snapshotsTaken.has(name)) {
  //   return;
  // }
  // _snapshotsTaken.add(name);

  // // Wait for the page to stabilize
  // // eslint-disable-next-line playwright/no-wait-for-timeout
  // await page.waitForTimeout(5_000);

  // try {
  //   await percySnapshot(page, name, {
  //     widths: [
  //       1380,
  //       options?.mobile != null ? 768 : undefined,
  //       options?.midSize != null ? 375 : undefined,
  //     ].filter((i): i is number => i != null),
  //   });
  // } catch (err) {
  //   // eslint-disable-next-line no-console
  //   console.error('error taking snapshot:', err);
  // }
};
