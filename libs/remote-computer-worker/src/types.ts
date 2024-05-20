// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedType } from '@decipad/language-types';

export interface TBaseNotificationParams<TMeta extends object> {
  meta?: TMeta;
  error?: string;
  loading?: boolean;
  result?: Result.AnyResult;
  [key: string]: unknown;
}

export type TSerializedNotificationParams<TMeta extends object> = Omit<
  TBaseNotificationParams<TMeta>,
  'result'
> & {
  result?: {
    type: SerializedType;
    value: ArrayBuffer;
  };
};
