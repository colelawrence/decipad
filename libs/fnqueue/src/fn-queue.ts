type AsyncFunction = () => Promise<unknown>;
type Fn = (value: unknown) => void;

interface FunctionQueue {
  push: (fn: AsyncFunction) => Promise<unknown>;
  flush: () => Promise<unknown>;
  pendingCount: () => number;
}

export function fnQueue(): FunctionQueue {
  const fns: AsyncFunction[] = [];
  let processing = 0;
  const flushes: Fn[] = [];

  async function processOne() {
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
      } finally {
        processing -= 1;
      }
      work();
    } else if (processing === 0 && fns.length === 0) {
      while (flushes.length) {
        // just checked length
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const resolveFlush = flushes.shift()!;
        resolveFlush(null);
      }
    }
  }

  function push(fn: AsyncFunction) {
    let resolve: Fn;
    let reject: Fn;
    const p = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    fns.push(async () => {
      try {
        resolve(await fn());
      } catch (err) {
        reject(err);
      }
    });
    work();

    return p;
  }

  async function flush() {
    if (fns.length === 0 && processing === 0) {
      return undefined;
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
    flush,
    pendingCount,
  };
}
