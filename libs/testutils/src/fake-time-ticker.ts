import { vi } from 'vitest';

export function createFakeTimeTicker(granularity: number) {
  let stopped = false;

  return async function doTickUntil(
    fn: () => Promise<unknown>
  ): Promise<unknown> {
    if (stopped) {
      throw new Error('ticker is already stopped');
    }

    async function tick(): Promise<void> {
      while (!stopped) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.resolve().then(() => {
          vi.advanceTimersByTime(granularity);
        });
      }
    }

    tick();
    try {
      return await fn();
    } finally {
      stopped = true;
    }
  };
}

export function tickUntil(
  fn: () => Promise<unknown>,
  granularity: number
): Promise<unknown> {
  return createFakeTimeTicker(granularity)(fn);
}
