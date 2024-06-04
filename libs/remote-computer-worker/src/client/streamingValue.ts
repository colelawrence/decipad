import type {
  SerializedType,
  Result,
  SerializedTypes,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type {
  ClientWorkerContext,
  StreamingValue,
  RecursiveDecoder,
} from './types';
import { streamingColumn } from './streamingColumn';
import { streamingTable } from './streamingTable';

export const streamingValue: StreamingValue = async (
  ctx: ClientWorkerContext,
  type:
    | SerializedTypes.Column
    | SerializedTypes.MaterializedColumn
    | SerializedTypes.Table
    | SerializedTypes.MaterializedTable,
  valueId: string,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
): Promise<Result.ResultColumn | Result.ResultTable> => {
  if (type.kind === 'column' || type.kind === 'materialized-column') {
    // stream reading column
    return streamingColumn(ctx, type, valueId, decoders);
  }

  // stream reading table
  return streamingTable(ctx, type, valueId, decoders, streamingValue);
};
