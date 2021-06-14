import { createReplica as replica } from './replica';
import { timeout } from './utils/timeout';
import { Runtime } from './runtime';
import { Sync } from './sync';

describe('replica', () => {
  test('gets inactive when it has no subscribers', async () => {
    const mockRuntime = {
      userId: 'test user id',
      actorId: 'test actor id',
      sync: new Sync(),
    } as unknown as Runtime;

    const r = replica<string>({
      name: 'test',
      runtime: mockRuntime,
      initialValue: '',
      createIfAbsent: true,
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

    expect(r.isActive()).toBe(true);

    s.unsubscribe();

    expect(expectedValues).toHaveLength(0);
    expect(r.isActive()).toBe(false);

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
    expect(r.isActive()).toBe(false);

    expect(expectedSubscriberCounts).toHaveLength(0);
    r.stop();
    expect(completedSubscriberCount).toBe(true);

    await timeout(2000);
  });
});
