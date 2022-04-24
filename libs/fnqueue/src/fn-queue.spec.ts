import { fnQueue } from './fn-queue';

describe('fn-queue', () => {
  it('should flush immediately when empty', async () => {
    const q = fnQueue();

    expect(
      await Promise.race([
        new Promise((resolve) => {
          setTimeout(() => resolve('too late'), 0);
        }),
        q.flush(),
      ])
    ).toBe(undefined);
  });

  it('should return the resolved value', async () => {
    const q = fnQueue();

    expect(await q.push(() => Promise.resolve(42))).toBe(42);
  });

  it('should continue working when work throws', async () => {
    const q = fnQueue();

    await expect(
      q.push(() => {
        throw new Error('some error');
      })
    ).rejects.toThrow('some error');
    expect(await q.push(() => Promise.resolve(42))).toBe(42);
  });

  it('should continue working when work throws asynchronously', async () => {
    const q = fnQueue();

    await expect(
      q.push(() => Promise.reject(new Error('some error')))
    ).rejects.toThrow('some error');
    expect(await q.push(() => Promise.resolve(42))).toBe(42);
  });

  it('should wait for flush', async () => {
    const q = fnQueue();
    let r1;
    let r2;
    q.push(() => Promise.resolve('r1')).then((v) => {
      r1 = v;
    });
    q.push(() => Promise.resolve('r2')).then((v) => {
      r2 = v;
    });
    await q.flush();

    expect(r1).toBe('r1');
    expect(r2).toBe('r2');
  });
});
