import {
  ColIndex,
  ImportElementSource,
  TableCellType,
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
}
