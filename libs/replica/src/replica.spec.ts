import { createReplica as replica } from './replica';
import { Sync } from './sync';
import { timeout } from './utils/timeout';

const syncOptions = {
  start: true,
  fetchPrefix: 'http://localhost:3333',
  maxReconnectMs: 3000,
};

describe('replica', () => {
  test('gets inactive when it has no subscribers', async () => {
    const r = replica<string>({
      name: 'test',
      userId: 'test user id',
      actorId: 'test actor id',
      sync: new Sync(syncOptions),
      initialValue: '',
      createIfAbsent: true,
      maxRetryIntervalMs: 3000,
      sendChangesDebounceMs: 1,
      fetchPrefix: syncOptions.fetchPrefix,
    });

    const expectedSubscriberCounts = [0, 1, 0, 1, 0];
    let completedSubscriberCount = false;
    r.subscriptionCountObservable.subscribe({
      next: (count) => {
        expect(count).toBe(expectedSubscriberCounts.shift());
      },
      complete: () => {
        completedSubscriberCount = true;
      },
    });

    const expectedValues = ['', 'A', 'AB'];
    let first = true;
    const s = r.observable.subscribe(({ loading, data: s }) => {
      if (first) {
        expect(loading).toBe(true);
        first = false;
      } else {
        expect(loading).toBe(false);
        expect(s).toBe(expectedValues.shift());
      }
    });

    r.mutate((s) => s + 'A');
    r.mutate((s) => s + 'B');

    s.unsubscribe();

    expect(expectedValues).toHaveLength(0);

    const expectedValues2 = ['AB', 'ABC', 'ABCD'];
    first = true;
    const s2 = r.observable.subscribe(({ loading, data: s }) => {
      if (first) {
        expect(loading).toBe(true);
        first = false;
      } else {
        expect(loading).toBe(false);
        expect(s).toBe(expectedValues2.shift());
      }
    });

    r.mutate((s) => s + 'C');
    r.mutate((s) => s + 'D');

    expect(r.getValue()).toBe('ABCD');

    s2.unsubscribe();

    expect(expectedValues2).toHaveLength(0);
    expect(expectedSubscriberCounts).toHaveLength(0);
    r.stop();
    expect(completedSubscriberCount).toBe(true);

    await timeout(2000);
  });
});
