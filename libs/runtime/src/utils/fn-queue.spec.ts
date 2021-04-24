import { fnQueue } from './fn-queue';

describe('fn-queue', () => {
  it('should flush when empty', async () => {
    const q = fnQueue();

    await q.flush()
  })

  it('should return the resolved value', async () => {
    const q = fnQueue();

    expect(await q.push(() => Promise.resolve(42))).toBe(42);
  })

  it('should continue working when work throws', async () => {
    const q = fnQueue();

    expect(
      q.push(
        () => { throw new Error('some error') }))
      .rejects.toThrow('some error');
    expect(await q.push(() => Promise.resolve(42))).toBe(42);
  })

  it('should continue working when work throws asynchronously', async () => {
    const q = fnQueue();

    expect(
      q.push(
        () => Promise.reject(new Error('some error'))))
      .rejects.toThrow('some error');
    expect(await q.push(() => Promise.resolve(42))).toBe(42);
  })

  it('should wait for flush', async () => {
    const q = fnQueue();
    let r1, r2;
    q.push(() => 'r1').then((v) => r1 = v);
    q.push(() => 'r2').then((v) => r2 = v)
    await q.flush();

    expect(r1).toBe('r1');
    expect(r2).toBe('r2');
  })
});
