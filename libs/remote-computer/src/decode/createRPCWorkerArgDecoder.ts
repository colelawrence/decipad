import type { RemoteValueStore } from '@decipad/remote-computer-worker/worker';
import type {
  RPCMethodName,
  TRPCArgDecoder,
  TRPCArgDecoders,
} from '../types/rpc';
import { decodeComputeDeltaRequest } from './decodeComputeDeltaRequest';
import { decodeAST } from './decodeAST';

const noChangeArgEncoder = <Args extends Array<unknown>>(
  _store: RemoteValueStore,
  args: Args
): Args => args;

export const argDecoders: TRPCArgDecoders = {
  expressionResult: (_store, [exp]) => [decodeAST(exp)],
  getStatement: noChangeArgEncoder,
  getSymbolDefinedInBlock: noChangeArgEncoder,
  variableExists: noChangeArgEncoder,
  getNamesDefined: noChangeArgEncoder,
  getAvailableIdentifier: noChangeArgEncoder,
  expressionType: (_store, [exp]) => [decodeAST(exp)],
  pushComputeDelta: async (_store, [delta]) => [
    await decodeComputeDeltaRequest(delta),
  ],
  computeDeltaRequest: async (_store, [delta]) => [
    await decodeComputeDeltaRequest(delta),
  ],
  getUnitFromText: noChangeArgEncoder,
  flush: noChangeArgEncoder,
  terminate: noChangeArgEncoder,
};

export const createRPCWorkerArgDecoder = <TMethodName extends RPCMethodName>(
  methodName: TMethodName
): TRPCArgDecoder<TMethodName> => argDecoders[methodName];
