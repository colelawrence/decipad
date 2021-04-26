function createFnQueue() {
  const fns = [];
  let processing = 0;
  const flushes = [];

  function push(fn) {
    let _resolve, _reject;
    const p = new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
    fns.push(async () => {
      try {
        _resolve(await fn());
      } catch (err) {
        _reject(err);
      }
    });
    maybeProcessOne();
    return p;
  }

  async function maybeProcessOne() {
    if (processing === 0 && fns.length > 0) {
      processing++;
      try {
        await processOne();
      } catch (err) {
        processing--;
        throw err;
      }
      processing--;
      maybeProcessOne();
    } else if (processing === 0 && fns.length === 0) {
      while (flushes.length) {
        const resolveFlush = flushes.shift();
        resolveFlush();
      }
    }
  }

  async function processOne() {
    const fn = fns.shift();

    await fn();
  }

  async function flush() {
    if (fns.length === 0 && processing === 0) {
      return;
    }
    return new Promise((resolve) => {
      flushes.push(resolve);
    });
  }

  return {
    push,
    flush,
  };
}

module.exports = createFnQueue;
