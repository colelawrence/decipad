/* eslint-disable no-restricted-globals */
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { tryImport } from '@decipad/import';
import { Result } from '@decipad/computer';
import { RPC } from '@mixer/postmessage-rpc';
import { nanoid } from 'nanoid';
import { dequal } from 'dequal';
import { createRPCResponse } from './createResponse';
import type { SubscriptionId } from './types';

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

interface SubscribeParams {
  url: string;
  source?: ImportElementSource;
  options?: RequestInit;
  pollIntervalSeconds?: number;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
}

interface UnsubscribeParams {
  subscriptionId: SubscriptionId;
}

interface Subscription {
  params: SubscribeParams;
  timer?: ReturnType<typeof setTimeout>;
  lastResult?: Result.Result;
}

const subscriptions = new Map<SubscriptionId, Subscription>();

const tryImportHere = async (subscriptionId: SubscriptionId) => {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    try {
      const result = await tryImport(
        new URL(sub.params.url),
        sub.params.source,
        {
          useFirstRowAsHeader: sub.params.useFirstRowAsHeader,
          columnTypeCoercions: sub.params.columnTypeCoercions,
        }
      );
      if (!dequal(sub.lastResult, result)) {
        sub.lastResult = result;
        const newResponse = createRPCResponse(result);
        await rpc.call('notify', { subscriptionId, newResponse });
      }
    } catch (err) {
      await rpc.call('notify', { subscriptionId, err });
    } finally {
      schedule(subscriptionId);
    }
  }
};

const schedule = (subscriptionId: SubscriptionId) => {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    setTimeout(
      () => tryImportHere(subscriptionId),
      (sub.params.pollIntervalSeconds || 10) * 1000
    );
  }
};

rpc.expose<SubscribeParams>('subscribe', async (params) => {
  const subscriptionId = nanoid();
  subscriptions.set(subscriptionId, { params });
  schedule(subscriptionId);
  tryImportHere(subscriptionId);
  return subscriptionId;
});

rpc.expose<UnsubscribeParams>('unsubscribe', async ({ subscriptionId }) => {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    if (sub.timer) {
      clearTimeout(sub.timer);
    }
    subscriptions.delete(subscriptionId);
  }
});

export {};
