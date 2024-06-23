// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedType } from '@decipad/language-interfaces';

export interface TBaseNotificationParams<TMeta extends object> {
  meta?: TMeta;
  error?: string;
  loading?: boolean;
  result?: Result.AnyResult;
  [key: string]: unknown;
}

export type SerializedResult = {
  type: SerializedType;
  value: ArrayBuffer;
};

export type TSerializedNotificationParams<TMeta extends object> = Omit<
  TBaseNotificationParams<TMeta>,
  'result'
> & {
  result?: SerializedResult;
};

export type RemoteValueStore = Map<string, Result.Result>;
