export function createFakeTimeTicker(granularity: number) {
  let stopped = false;

  function tickUntil(promise: Promise<any>): Promise<any> {
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
      await Promise.resolve().then(() => {
        jest.advanceTimersByTime(granularity);
      });
    }
  }

  return tickUntil;
}

export function tickUntil(
  promise: Promise<any>,
  granularity: number
): Promise<any> {
  return createFakeTimeTicker(granularity)(promise);
}
