import type {
  SerializedType,
  SerializedTypes,
  Result,
} from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';
import type { SharedRPC } from '../utils/SharedRPC';

export type RecursiveDecoder = (
  type: SerializedType,
  buffer: DataView,
  offset: number,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
) => PromiseOrType<[Result.OneResult, number]>;

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

export type ValueDecoder = (
  buffer: DataView,
  offset: number
) => PromiseOrType<[Result.OneResult, number]>;
