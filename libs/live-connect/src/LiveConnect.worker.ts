/* eslint-disable no-restricted-globals */
import './utils/workerPolyfills';
import { ImportResult, tryImport } from '@decipad/import';
import { Computer, setErrorReporter } from '@decipad/computer';
import { getNotebook, getURLComponents } from '@decipad/editor-utils';
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
import { materializeImportResult } from './utils/materializeImportResult';

setErrorReporter((err) => {
  console.error('Error caught on computer', err);
});

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

const reply = async (
  subscriptionId: string,
  error?: Error,
  newResponse?: ImportResult
) => {
  // eslint-disable-next-line no-console
  console.debug('Live connect worker replying', { error, newResponse });
  if (error) {
    await rpc.call('notify', {
      subscriptionId,
      error: error?.message,
    });
  } else {
    await rpc.call('notify', {
      subscriptionId,
      newResponse: newResponse && (await materializeImportResult(newResponse)),
    });
  }
};

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
      sub.notify({ loading: true });
      const results = await tryImport(
        {
          computer,
          url: new URL(sub.params.url),
          proxy: sub.params.proxy ? new URL(sub.params.proxy) : undefined,
          provider: sub.params.source,
        },
        {
          useFirstRowAsHeader: sub.params.useFirstRowAsHeader,
          columnTypeCoercions: sub.params.columnTypeCoercions,
          maxCellCount: sub.params.maxCellCount,
          jsonPath: sub.params.jsonPath,
          delimiter: sub.params.delimiter,
        }
      );
      for (const result of results) {
        sub.notify(result);
      }
    } catch (err) {
      console.error(
        `subscription ${subscriptionId}: caught error while trying to import from ${sub.params.url}`,
        err
      );
      onError(subscriptionId, sub.params)(err as Error);
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
      (sub.params.pollIntervalSeconds || 60) * 1000
    );
  }
};

const notify = (subscriptionId: string) => {
  return async (result: ImportResult) => {
    let lastResult: ImportResult | undefined;
    if (!dequal(lastResult, result)) {
      lastResult = result;
      const newResponse = createRPCResponse(result);
      await reply(subscriptionId, undefined, newResponse);
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
      subscription.params.url === subscriptionRequest.params.url &&
      subscription.params.proxy === subscriptionRequest.params.proxy
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
      await reply(parentSubscriptionId, err as Error);
    }
    return undefined;
  };

const onError =
  (subscriptionId: string, params: SubscribeParams) => async (err: Error) => {
    console.error(
      `Worker: error caught on worker ${params.url}: ${(err as Error).message}`,
      err
    );
    await reply(subscriptionId, err);
  };

const deferringError =
  (subscriptionId: string, params: SubscribeParams) => (message: string) => {
    setTimeout(() => {
      onError(subscriptionId, params)(new Error(message));
    }, 0);
  };

const subscribeInternal = async (
  subscriptionId: string,
  subscription: Subscription
) => {
  const deferError = deferringError(subscriptionId, subscription.params);
  subscriptions.set(subscriptionId, subscription);
  const { params } = subscription;
  if (params.source === 'decipad') {
    const { startNotebook } = await import('./notebook');
    const { docId } = getURLComponents(subscription.params.url);
    const { hasAccess, exists } = await getNotebook(docId);
    const error = !exists
      ? 'Notebook does not exist'
      : !hasAccess
      ? "You don't have access to this notebook"
      : undefined;
    if (error) {
      deferError(error);
      return;
    }
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

rpc.expose<UnsubscribeParams>('unsubscribe', ({ subscriptionId }) => {
  unsubscribe(subscriptionId);
});

export {};
