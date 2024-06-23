/* eslint-disable no-restricted-globals */
import './workerPolyfills';
import { nanoid } from 'nanoid';
import type { ImportResult } from '@decipad/import';
import { tryImport } from '@decipad/import';
// eslint-disable-next-line no-restricted-imports
import { getComputer, setErrorReporter } from '@decipad/computer';
// import { getNotebook, getURLComponents } from '@decipad/editor-utils';
import { createWorkerWorker } from '@decipad/remote-computer-worker/worker';
import type { Computer } from '@decipad/computer-interfaces';
import type {
  Observe,
  SubscribeParams,
  Subscription,
  SubscriptionId,
} from '../types';
import type { StartNotebook } from '../notebook';
import { getNotebook, getURLComponents } from './getEditorDeps';

if (typeof importScripts === 'function') {
  // eslint-disable-next-line no-console
  console.debug('live connect worker starting...');

  setErrorReporter((err) => {
    // eslint-disable-next-line no-console
    console.error('Error caught on computer', err);
  });

  const subscriptions = new Map<SubscriptionId, Subscription>();

  const reply = async (
    subscriptionId: string,
    error?: Error,
    newResponse?: ImportResult
  ) => {
    const sub = subscriptions.get(subscriptionId);
    if (!sub) {
      return;
    }
    if (error) {
      await sub.notify({ error: error?.message, loading: false });
    } else if (newResponse) {
      await sub.notify(newResponse);
    }
  };

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
            subId: sub.params.subId,
            query: sub.params.query,
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

  const hasCircularDependency = (
    subscriptionRequest: Subscription
  ): boolean => {
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
        `Worker: error caught on worker ${params.url}: ${
          (err as Error).message
        }`,
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

      // Hacky, but gets types working!
      // eslint-ignore-next-line import/no-unresolved
      const { startNotebook: _startNotebook } = await import('../notebook');

      const startNotebook = _startNotebook as StartNotebook;

      startNotebook(
        subscription,
        observe(subscriptionId),
        onError(subscriptionId, params)
      );
    } else {
      const computer = getComputer();
      schedule(computer, subscriptionId);
      setTimeout(() => {
        tryImportHere(computer, subscriptionId);
      }, 0);
    }
  };

  const subscribe = async (
    params: SubscribeParams,
    notify: (result: ImportResult) => void | Promise<void>
  ) => {
    const subscriptionId = nanoid();
    const subscription: Subscription = { params, notify };
    await subscribeInternal(subscriptionId, subscription);

    return subscriptionId;
  };

  createWorkerWorker({
    postMessage: (message) => {
      try {
        self.postMessage(message);
      } catch (err) {
        console.error('Error posting message', message);
        throw err;
      }
    },
    readMessages: (cb) => {
      self.addEventListener('message', cb);
      return () => self.removeEventListener('message', cb);
    },
    subscribe: async (params, notify) => {
      const subscriptionId = await subscribe(
        params as SubscribeParams,
        notify as (result: ImportResult) => void | Promise<void>
      );
      return () => {
        unsubscribe(subscriptionId);
      };
    },
    serviceId: 'live-connect',
  });

  // eslint-disable-next-line no-console
  console.debug('Live connect worker started');
}
// eslint-disable-next-line import/no-anonymous-default-export
export default {};
