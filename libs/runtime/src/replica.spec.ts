import { createReplica as replica } from './replica';
import { timeout } from './utils/timeout';


describe('replica', () => {
  test('it works gets inactive when it has no subscribers', async () => {
    const r = replica<string>('test', 'test user id', 'test actor id', '');

    const expectedSubscriberCounts = [0, 1, 0, 1, 0]
    let completedSubscriberCount = false
    r.subscriptionCountObservable.subscribe({
      next: (count) => {
        expect(count).toBe(expectedSubscriberCounts.shift())
      },
      complete: () => {
        completedSubscriberCount = true
      }
    })

    expect(r.isActive()).toBe(false);

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

    expect(r.isActive()).toBe(true);

    r.mutate((s) => s + 'C');
    r.mutate((s) => s + 'D');

    expect(r.getValue()).toBe('ABCD');

    s2.unsubscribe();

    expect(expectedValues2).toHaveLength(0);
    expect(r.isActive()).toBe(false);

    expect(expectedSubscriberCounts).toHaveLength(0)
    r.stop()
    expect(completedSubscriberCount).toBe(true)

    await timeout(2000)
  });
});
