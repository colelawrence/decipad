// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedType } from '@decipad/language-interfaces';

export interface TBaseNotificationParams<TMeta extends object> {
  meta?: TMeta;
  error?: string;
  loading?: boolean;
  result?: Result.AnyResult;
  blockId?: string;
  [key: string]: unknown;
}

export interface SerializedResultMetadata {
  labels?: Awaited<Result.ResultMetadataColumn['labels']>;
}

export type SerializedResult = {
  type: SerializedType;
  value: ArrayBuffer;
  meta: undefined | SerializedResultMetadata;
};

export type TSerializedNotificationParams<TMeta extends object> = Omit<
  TBaseNotificationParams<TMeta>,
  'result'
> & {
  result?: SerializedResult;
};

export interface RemoteValueStore {
  set(blockId: string | undefined, key: string, value: Result.Result): void;
  get(key: string): Result.Result | undefined;
  delete(key: string): void;
}
// Map<string, Result.Result>;
