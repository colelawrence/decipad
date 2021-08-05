import { Change, Doc } from 'automerge';

export type { Change, Doc };

export interface AsyncSubject<T> {
  error: Error | null;
  loading: boolean;
  data: T | null;
}

export interface Mutation<T> {
  before: T | null;
  after: T | null;
}

export interface TopicSubscriptionOperation {
  op: 'add' | 'remove';
  topic: string;
}

export interface DocMetadata {
  createdLocally: boolean;
}

export type RemoteWebSocketOp =
  | {
      o: 's' | 'u';
      t: string;
      c: null;
      type?: string;
    }
  | {
      o: 'c';
      t: string;
      c: Change[];
      type?: string;
    };

export type RemoteOp =
  | {
      op: 'subscribed' | 'unsubscribed';
      topic: string;
      changes: null;
    }
  | {
      op: 'changed';
      topic: string;
      changes: Change[];
    };

// false positives, ESLint confused by enum
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars  */
export enum SyncStatus {
  Unknown = 1,
  LocalChanged,
  RemoteChanged,
  Reconciling,
  Reconciled,
  Errored,
}
