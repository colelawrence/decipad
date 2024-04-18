import { all } from './all';
import { queuedGen } from './queuedGen';

describe('queuedGen', () => {
  it('queues', async () => {
    const queue = queuedGen<number>();

    (async () => {
      await queue.push(1);
      queue.push(2);
      setTimeout(() => {
        queue.push(4);
        queue.end();
      }, 0);
      queue.push(3);
    })();

    expect(await all(queue.gen())).toEqual([1, 2, 3, 4]);
  });
});
