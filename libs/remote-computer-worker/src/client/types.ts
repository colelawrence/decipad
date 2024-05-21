import type {
  SerializedType,
  SerializedTypes,
  Result,
} from '@decipad/language-interfaces';
import type { SharedRPC } from '../utils/SharedRPC';
import type { RecursiveDecoder } from './valueDecoder';

export interface ClientWorkerContext {
  rpc: SharedRPC;
  finalizationRegistry: FinalizationRegistry<string>;
  refCounter: Map<string, number>;
}

export type StreamingValue = (
  ctx: ClientWorkerContext,
  type:
    | SerializedTypes.Column
    | SerializedTypes.MaterializedColumn
    | SerializedTypes.Table
    | SerializedTypes.MaterializedTable,
  valueId: string,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
) => Promise<Result.ResultColumn | Result.ResultTable>;
