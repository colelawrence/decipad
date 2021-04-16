type AsyncFunction = () => Promise<unknown>
type Fn = (value: unknown) => void

export function fnQueue () {
  const fns : AsyncFunction[] = []
  let processing = 0
  const flushes: Fn[] = []

  function push (fn: AsyncFunction) {
    fns.push(fn)
    work()
  }

  async function work () {
    if ((processing === 0) && (fns.length > 0)) {
      processing++
      try {
        await processOne()
      } finally {
        processing--
      }
      work()
    } else if (processing === 0 && fns.length === 0) {
      while (flushes.length) {
        const resolveFlush = flushes.shift()
        resolveFlush!(null)
      }
    }
  }

  async function processOne () {
    const fn = fns.shift()

    await fn!()
  }

  async function flush () {
    if (fns.length === 0 && processing === 0) {
      return
    }
    return new Promise((resolve) => {
      flushes.push(resolve)
    })
  }

  return {
    push,
    flush
  }
}

