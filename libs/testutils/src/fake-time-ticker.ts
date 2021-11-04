export function createFakeTimeTicker(granularity: number) {
  let stopped = false;

  return function doTickUntil(fn: () => Promise<unknown>): Promise<unknown> {
    if (stopped) {
      throw new Error('ticker is already stopped');
    }

    async function tick(): Promise<void> {
      while (!stopped) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.resolve().then(() => {
          jest.advanceTimersByTime(granularity);
        });
      }
    }

    tick();
    return fn()
      .finally(() => {
        stopped = true;
      })
      .catch((err) => {
        throw err;
      });
  };
}

export function tickUntil(
  fn: () => Promise<unknown>,
  granularity: number
): Promise<unknown> {
  return createFakeTimeTicker(granularity)(fn);
}
