import { describe, it, expect } from 'vitest';
import { createSubscriptionCentral } from './SubscriptionCentral';
import type { TSubscribeToRemote } from './types/SubscriptionCentral';

describe('SubscriptionCentral', () => {
  it('should keep track of subscriptions to remote', async () => {
    const remoteSubscriptionCounts = new Map<string, number>();

    const subscribeToRemote: TSubscribeToRemote = async (
      subjectName: string
    ) => {
      remoteSubscriptionCounts.set(
        subjectName,
        (remoteSubscriptionCounts.get(subjectName) || 0) + 1
      );

      let closed = false;
      return {
        unsubscribe: () => {
          closed = true;
          remoteSubscriptionCounts.set(
            subjectName,
            (remoteSubscriptionCounts.get(subjectName) || 0) - 1
          );
        },
        get closed() {
          return closed;
        },
      };
    };
    const central = createSubscriptionCentral(subscribeToRemote, {
      waitForReleaseMs: 0,
    });

    const unsub1 = await central
      .subscribe(
        'results$',
        { blockResults: {}, indexLabels: new Map() },
        [],
        () => ''
      )
      .subscribe(() => {});

    expect(remoteSubscriptionCounts.get('results$')).toBe(1);

    const unsub2 = await central
      .subscribe(
        'results$',
        { blockResults: {}, indexLabels: new Map() },
        [],
        () => ''
      )
      .subscribe(() => {});

    expect(remoteSubscriptionCounts.get('results$')).toBe(1);

    unsub1.unsubscribe();

    expect(remoteSubscriptionCounts.get('results$')).toBe(1);

    unsub2.unsubscribe();

    expect(remoteSubscriptionCounts.get('results$')).toBe(0);

    unsub2.unsubscribe();

    expect(remoteSubscriptionCounts.get('results$')).toBe(0);
  });
});
