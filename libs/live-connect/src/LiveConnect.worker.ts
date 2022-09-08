/* eslint-disable no-restricted-globals */
import './utils/workerPolyfills';
import { tryImport } from '@decipad/import';
import { Computer, Result } from '@decipad/computer';
import { RPC } from '@mixer/postmessage-rpc';
import { nanoid } from 'nanoid';
import { dequal } from 'dequal';
import { createRPCResponse } from './createResponse';
import type {
  Observe,
  SubscribeParams,
  Subscription,
  SubscriptionId,
} from './types';

const rpc = new RPC({
  target: {
    postMessage: (data) => {
      self.postMessage(data);
    },
  },
  receiver: {
    readMessages: (cb) => {
      const listener = (ev: MessageEvent) => {
        cb(ev);
      };
      self.addEventListener('message', listener);
      return () => self.removeEventListener('message', listener);
    },
  },
  serviceId: 'live-connect',
});

interface UnsubscribeParams {
  subscriptionId: SubscriptionId;
}

const subscriptions = new Map<SubscriptionId, Subscription>();

const tryImportHere = async (
  computer: Computer,
  subscriptionId: SubscriptionId
) => {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    try {
      const result = await tryImport(
        computer,
        new URL(sub.params.url),
        sub.params.source,
        {
          useFirstRowAsHeader: sub.params.useFirstRowAsHeader,
          columnTypeCoercions: sub.params.columnTypeCoercions,
        }
      );
      sub.notify(result);
    } catch (err) {
      console.error(
        `subscription ${subscriptionId}: caught error while trying to import from ${sub.params.url}`,
        err
      );
      await rpc.call('notify', {
        subscriptionId,
        error: (err as Error).message,
      });
    } finally {
      schedule(computer, subscriptionId);
    }
  }
};

const schedule = (computer: Computer, subscriptionId: SubscriptionId) => {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    setTimeout(
      () => tryImportHere(computer, subscriptionId),
      (sub.params.pollIntervalSeconds || 10) * 1000
    );
  }
};

const notify = (subscriptionId: string) => {
  return async (result: Result.Result) => {
    let lastResult: Result.Result | undefined;
    if (!dequal(lastResult, result)) {
      lastResult = result;
      const newResponse = createRPCResponse(result);
      await rpc.call('notify', { subscriptionId, newResponse });
    }
  };
};

const unsubscribe = (subscriptionId: string) => {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    if (sub.timer) {
      clearTimeout(sub.timer);
    }
    if (sub.subscription) {
      sub.subscription.unsubscribe();
    }
    subscriptions.delete(subscriptionId);
  }
};

const hasCircularDependency = (subscriptionRequest: Subscription): boolean => {
  // detect find out if we're already subscribed
  for (const subscription of subscriptions.values()) {
    if (
      subscription.params.source === subscriptionRequest.params.source &&
      subscription.params.url === subscriptionRequest.params.url
    ) {
      return true;
    }
  }
  return false;
};

const observe =
  (parentSubscriptionId: string): Observe =>
  async (subscriptionRequest: Subscription, throwOnError = false) => {
    try {
      if (hasCircularDependency(subscriptionRequest)) {
        throw new Error(
          `Circular dependency detected for ${subscriptionRequest.params.url}`
        );
      }
      const subscriptionId = nanoid();
      await subscribeInternal(subscriptionId, subscriptionRequest);
      let closed = false;
      return {
        get closed() {
          return closed;
        },
        unsubscribe: () => {
          closed = true;
          unsubscribe(subscriptionId);
        },
      };
    } catch (err) {
      if (throwOnError) {
        throw err;
      }
      rpc.call('notify', {
        subscriptionId: parentSubscriptionId,
        error: (err as Error).message,
      });
    }
    return undefined;
  };

const onError =
  (subscriptionId: string, params: SubscribeParams) =>
  (err: Error): void => {
    console.error(
      `Worker: error caught on worker ${params.url}: ${(err as Error).message}`,
      err
    );
    rpc.call('notify', {
      subscriptionId,
      error: (err as Error).message,
    });
  };

const subscribeInternal = async (
  subscriptionId: string,
  subscription: Subscription
) => {
  subscriptions.set(subscriptionId, subscription);
  const { params } = subscription;
  if (params.source === 'decipad') {
    const { startNotebook } = await import('./notebook');
    await startNotebook(
      subscription,
      observe(subscriptionId),
      onError(subscriptionId, params)
    );
  } else {
    const computer = new Computer();
    schedule(computer, subscriptionId);
    setTimeout(() => {
      tryImportHere(computer, subscriptionId);
    }, 0);
  }
};

const subscribe = async (params: SubscribeParams) => {
  const subscriptionId = nanoid();
  const subscription: Subscription = { params, notify: notify(subscriptionId) };
  await subscribeInternal(subscriptionId, subscription);

  return subscriptionId;
};

rpc.expose<SubscribeParams>('subscribe', subscribe);

rpc.expose<UnsubscribeParams>('unsubscribe', async ({ subscriptionId }) => {
  unsubscribe(subscriptionId);
});

export {};
