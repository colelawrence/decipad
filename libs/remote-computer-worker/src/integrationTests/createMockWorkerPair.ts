/* eslint-disable no-console */
import { Subject } from 'rxjs';
import { MockWorker } from './MockWorker';
import cloneDeep from 'lodash/cloneDeep';

const cloning = (handle: (data: unknown) => void) => (data: unknown) =>
  handle(cloneDeep(data));

export const createMockWorkerPair = (): [
  MockWorker,
  MockWorker,
  () => void
] => {
  let connected = false;
  const a = new Subject<unknown>();
  let aReceiveQueue: Array<unknown> = [];
  const b = new Subject<unknown>();
  let bReceiveQueue: Array<unknown> = [];

  const w1 = new MockWorker(
    cloning((data) => {
      if (connected) {
        a.next(data);
      } else {
        aReceiveQueue.push(data);
      }
    }),
    b
  );
  const w2 = new MockWorker(
    cloning((data) => {
      if (connected) {
        b.next(data);
      } else {
        bReceiveQueue.push(data);
      }
    }),
    a
  );

  const connect = () => {
    for (const m of aReceiveQueue) {
      a.next(m);
    }
    aReceiveQueue = [];
    for (const m of bReceiveQueue) {
      b.next(m);
    }
    bReceiveQueue = [];
    connected = true;
  };

  return [w1, w2, connect];
};
