/* eslint-disable no-console */
import { PromiseOrType, noop } from '@decipad/utils';

type AsyncFunction<T> = () => PromiseOrType<T>;
type Fn<T> = (value: T) => void;

type FunctionQueue = {
  push: <T>(fn: AsyncFunction<T>) => Promise<T>;
  unshift: <T>(fn: AsyncFunction<T>) => Promise<T>;
  flush: () => Promise<unknown>;
  pendingCount: () => number;
};

export interface FnQueueOptions {
  onError?: (err: unknown, finalRetry: boolean) => unknown;
  maxRetries?: number;
  isRetryable?: (err: unknown) => boolean;
}

const returnsFalse = () => false;

const isTesting = process.env.JEST_WORKER_ID != null;

export function fnQueue({
  onError = noop,
  maxRetries = 0,
  isRetryable = returnsFalse,
}: FnQueueOptions = {}): FunctionQueue {
  const fns: AsyncFunction<unknown>[] = [];
  let processing = 0;
  const flushes: Fn<void>[] = [];

  async function callFn<T>(
    fn: AsyncFunction<T>,
    previousRetryCount = 0
  ): Promise<T> {
    const handleError = (err: unknown) => {
      if (previousRetryCount < maxRetries && isRetryable(err)) {
        onError(err, false);
        if (!isTesting) {
          console.log('going to retry');
        }
        return callFn(fn, previousRetryCount + 1);
      }
      onError(err, true);
      throw err;
    };

    try {
      return Promise.resolve(fn()).catch(handleError);
      // return await fn();
    } catch (err) {
      return handleError(err);
    }
  }

  function processOne() {
    const fn = fns.shift();
    if (!fn) {
      throw new Error('Expected to have a function left in the queue');
    }

    return fn();
  }

  async function work() {
    if (processing === 0 && fns.length > 0) {
      processing += 1;
      try {
        await processOne();
      } catch (err) {
        await onError(err, true);
      } finally {
        processing -= 1;
      }
      work();
    } else if (processing === 0 && fns.length === 0) {
      while (flushes.length) {
        // just checked length
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const resolveFlush = flushes.shift()!;
        resolveFlush();
      }
    }
  }

  function push<T>(fn: AsyncFunction<T>): Promise<T> {
    const p = new Promise<T>((resolve, reject) => {
      fns.push(() => callFn(fn).then(resolve).catch(reject));
    });
    setTimeout(work, 0);
    return p;
  }

  function unshift<T>(fn: AsyncFunction<T>): Promise<T> {
    const p = new Promise<T>((resolve, reject) => {
      fns.unshift(() => callFn(fn).then(resolve).catch(reject));
    });
    setTimeout(work, 0);
    return p;
  }

  function flush() {
    if (fns.length === 0 && processing === 0) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      flushes.push(resolve);
    });
  }

  function pendingCount() {
    return fns.length;
  }

  return {
    push,
    unshift,
    flush,
    pendingCount,
  };
}
