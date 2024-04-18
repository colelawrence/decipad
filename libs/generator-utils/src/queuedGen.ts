import { getTrue } from '@decipad/utils';

export const queuedGen = <T>() => {
  const queue: Array<T> = [];
  let genStarted = false;
  let done = false;
  let error: Error | undefined;
  let signalCB: (() => void) | undefined;
  let flushedCB: (() => void) | undefined;

  const waitForSignal = () => {
    const previousSignalCB = signalCB;
    return new Promise<void>((resolve) => {
      signalCB = resolve;
    }).then(() => {
      previousSignalCB?.();
      signalCB = undefined;
    });
  };

  const signal = () => {
    if (signalCB) {
      signalCB();
      signalCB = undefined;
    }
  };

  const waitForFlushed = () => {
    if (!queue.length) {
      return Promise.resolve();
    }
    const previousFlushedCB = flushedCB;
    return new Promise<void>((resolve) => {
      flushedCB = resolve;
    }).then(() => {
      previousFlushedCB?.();
      flushedCB = undefined;
    });
  };

  const signalFlushed = () => {
    if (flushedCB) {
      flushedCB();
      flushedCB = undefined;
    }
  };

  return {
    push: (value: T): Promise<void> => {
      getTrue(!done, 'Cannot push after ending generator');
      queue.push(value);
      signal();
      return waitForFlushed();
    },
    end: (err?: Error) => {
      if (done) {
        return;
      }
      done = true;
      error = err;
      signal();
    },
    async *gen(): AsyncGenerator<T> {
      getTrue(!genStarted, 'Cannot start generator more than once');
      genStarted = true;
      while (true) {
        while (queue.length) {
          const next = queue.shift() as T;
          yield next;
        }
        signalFlushed();
        if (done) {
          if (error) {
            throw error;
          }
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await waitForSignal();
      }
    },
  };
};
