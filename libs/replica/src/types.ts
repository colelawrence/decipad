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

export interface RemoteWebSocketOp {
  o: 's' | 'u' | 'c';
  t: string;
  c: Change[] | null;
  type?: string;
}

export interface RemoteOp {
  op: 'subscribed' | 'unsubscribed' | 'changed';
  topic: string;
  changes: Change[] | null;
}

export enum SyncStatus {
  Unknown = 1,
  LocalChanged,
  RemoteChanged,
  Reconciling,
  Reconciled,
  Errored,
}
