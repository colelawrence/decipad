import { SubscriptionLike } from 'rxjs';
import {
  ImportElementSource,
  LiveConnectionElement,
  TableCellType,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';

export type SubscriptionId = string;

export type RPCResponse = ImportResult;

export type SubscriptionListener = (
  error: Error | undefined,
  newResponse?: ImportResult
) => void;
export type Unsubscribe = () => void;

export interface LiveConnectionWorker {
  subscribe: (
    props: Omit<SubscribeParams, 'pollIntervalSeconds'>,
    listener: SubscriptionListener
  ) => Promise<Unsubscribe>;
  terminate: () => void;
  worker: Worker;
}

export interface SubscribeParams {
  url: string;
  proxy?: string;
  source?: ImportElementSource;
  options?: RequestInit;
  pollIntervalSeconds?: number;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<number, TableCellType>;
  maxCellCount?: number;
}

export interface Subscription {
  params: SubscribeParams;
  timer?: ReturnType<typeof setTimeout>;
  subscription?: SubscriptionLike;
  notify: (result: ImportResult) => void | Promise<void>;
}

export type Observe = (
  subscription: Subscription,
  throwOnError?: boolean
) => Promise<SubscriptionLike | undefined>;

export type ConnectionResult = {
  source: LiveConnectionElement;
  result: ImportResult;
};
