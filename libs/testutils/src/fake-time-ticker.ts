export function createFakeTimeTicker(granularity: number) {
  let stopped = false;

  function doTickUntil(promise: Promise<unknown>): Promise<unknown> {
    if (stopped) {
      throw new Error('ticker is already stopped');
    }

    return Promise.race([
      tick(),
      promise.finally(() => {
        stopped = true;
      }),
    ]);
  }

  async function tick(): Promise<void> {
    while (!stopped) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve().then(() => {
        jest.advanceTimersByTime(granularity);
      });
    }
  }

  return doTickUntil;
}

export function tickUntil(
  promise: Promise<unknown>,
  granularity: number
): Promise<unknown> {
  return createFakeTimeTicker(granularity)(promise);
}
