import type { Computer } from '@decipad/computer-interfaces';
import type {
  SerializedASTExpression,
  SerializedAutocompleteNames,
  SerializedComputeDeltaRequest,
  SerializedNotebookResults,
  SerializedResult,
  SerializedSerializedType,
  SerializedUnit,
} from './serializedTypes';
import type { PromiseOrType } from '@decipad/utils';
import type { RemoteValueStore } from '@decipad/remote-computer-worker/worker';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';

export type RPCMethodName =
  | 'expressionResult'
  | 'getStatement'
  | 'variableExists'
  | 'getAvailableIdentifier'
  | 'getSymbolDefinedInBlock'
  | 'getNamesDefined'
  | 'expressionType'
  | 'pushComputeDelta'
  | 'computeDeltaRequest'
  | 'getUnitFromText'
  | 'flush'
  | 'terminate'
  | 'waitForTriedCache'
  | 'setTriedCache';

// Args

export type TRPCDecodedArgs<TMethodName extends RPCMethodName> = Parameters<
  Computer[TMethodName]
>;

export type TRPCEncodedArgs<TMethodName extends RPCMethodName> =
  TMethodName extends 'pushComputeDelta' | 'computeDeltaRequest'
    ? [SerializedComputeDeltaRequest]
    : TMethodName extends 'expressionType' | 'expressionResult'
    ? [SerializedASTExpression]
    : Parameters<Computer[TMethodName]>;

export type TRPCArgEncoder<TMethodName extends RPCMethodName> = (
  args: TRPCDecodedArgs<TMethodName>
) => PromiseOrType<TRPCEncodedArgs<TMethodName>>;

export type TRPCArgEncoders = {
  [methodName in RPCMethodName]: TRPCArgEncoder<methodName>;
};

export type TRPCArgDecoder<TMethodName extends RPCMethodName> = (
  store: RemoteValueStore,
  args: TRPCEncodedArgs<TMethodName>
) => PromiseOrType<TRPCDecodedArgs<TMethodName>>;

export type TRPCArgDecoders = {
  [methodName in RPCMethodName]: TRPCArgDecoder<methodName>;
};

// Results

export type TRPCDecodedResult<TMethodName extends RPCMethodName> = Awaited<
  ReturnType<Computer[TMethodName]>
>;

// TODO: extend this type
export type TRPCEncodedResult<TMethodName extends RPCMethodName> =
  TMethodName extends 'expressionResult'
    ? SerializedResult
    : TMethodName extends 'expressionType'
    ? SerializedSerializedType
    : TMethodName extends 'getUnitFromText'
    ? SerializedUnit[] | null
    : TMethodName extends 'computeDeltaRequest'
    ? SerializedNotebookResults | null
    : TMethodName extends 'getNamesDefined'
    ? SerializedAutocompleteNames
    : Awaited<ReturnType<Computer[TMethodName]>>;

export type TRPCResultEncoder<TMethodName extends RPCMethodName> = (
  result: TRPCDecodedResult<TMethodName>,
  store: RemoteValueStore
) => PromiseOrType<TRPCEncodedResult<TMethodName>>;

export type TRPCResultEncoders = {
  [methodName in RPCMethodName]: TRPCResultEncoder<methodName>;
};

export type TRPCResultDecoder<TMethodName extends RPCMethodName> = (
  context: ClientWorkerContext,
  result: TRPCEncodedResult<TMethodName>
) => PromiseOrType<TRPCDecodedResult<TMethodName>>;

export type TRPCResultDecoders = {
  [methodName in RPCMethodName]: TRPCResultDecoder<methodName>;
};

// Handler

export type TRPCWorkerHandler<TMethodName extends RPCMethodName> = (
  args: TRPCEncodedArgs<TMethodName>
) => Promise<TRPCEncodedResult<TMethodName>>;

export type TRPCClientHandler<TMethodName extends RPCMethodName> = (
  ...args: TRPCEncodedArgs<TMethodName>
) => Promise<TRPCDecodedResult<TMethodName>>;
