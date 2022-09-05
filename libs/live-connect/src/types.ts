import { SubscriptionLike } from 'rxjs';
import {
  ImportElementSource,
  LiveConnectionElement,
  TableCellType,
  ColIndex,
} from '@decipad/editor-types';
import { Result } from '@decipad/computer';

export type SubscriptionId = string;

export type RPCResponse = Result.Result;

export type SubscriptionListener = (
  error: Error | undefined,
  newResponse?: Result.Result
) => void;
export type Unsubscribe = () => void;

export interface LiveConnectionWorker {
  subscribe: (
    props: {
      url: string;
      source?: ImportElementSource;
      options: RequestInit | undefined;
      useFirstRowAsHeader?: boolean;
      columnTypeCoercions: Record<ColIndex, TableCellType>;
    },
    listener: SubscriptionListener
  ) => Promise<Unsubscribe>;
  terminate: () => void;
  worker: Worker;
}

export interface SubscribeParams {
  url: string;
  source?: ImportElementSource;
  options?: RequestInit;
  pollIntervalSeconds?: number;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<number, TableCellType>;
}

export interface Subscription {
  params: SubscribeParams;
  timer?: ReturnType<typeof setTimeout>;
  subscription?: SubscriptionLike;
  notify: (result: Result.Result) => void | Promise<void>;
}

export type Observe = (
  subscription: Subscription,
  throwOnError?: boolean
) => Promise<SubscriptionLike | undefined>;

export type ConnectionResult = {
  source: LiveConnectionElement;
  result: Result.Result;
};
