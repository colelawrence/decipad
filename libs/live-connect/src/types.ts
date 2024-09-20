import type { SubscriptionLike } from 'rxjs';
import type { ImportElementSource, TableCellType } from '@decipad/editor-types';
import type { ImportResult } from '@decipad/import';
import type { RemoteWorker } from '@decipad/remote-computer-worker/client';

export type SubscriptionId = string;

export type RPCResponse = ImportResult & {
  error?: string;
};

export interface SubscribeParams {
  url: string;
  proxy?: string;
  source?: ImportElementSource;
  options?: RequestInit;
  pollIntervalSeconds?: number;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<number, TableCellType>;
  maxCellCount?: number;
  jsonPath?: string;
  delimiter?: string;
  padId?: string;
  query?: string;
  useCache?: boolean;
}

export interface Subscription {
  id: SubscriptionId;
  params: SubscribeParams;
  timer?: ReturnType<typeof setTimeout>;
  subscription?: SubscriptionLike;
  notify: (result: RPCResponse) => unknown;
  import: () => Promise<void>;
}

export type Observe = (
  subscription: Omit<Subscription, 'id' | 'import'>,
  throwOnError?: boolean
) => Promise<SubscriptionLike | undefined>;

export type ConnectionResult = {
  result: ImportResult;
};

export type LiveConnectionWorker = RemoteWorker<SubscribeParams, RPCResponse>;
