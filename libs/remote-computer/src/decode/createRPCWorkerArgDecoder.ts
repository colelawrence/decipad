import type { RemoteValueStore } from '@decipad/remote-computer-worker/worker';
import type {
  RPCMethodName,
  TRPCArgDecoder,
  TRPCArgDecoders,
} from '../types/rpc';
import { decodeComputeDeltaRequest } from './decodeComputeDeltaRequest';
import { decodeAST } from './decodeAST';

// eslint-disable-next-line no-restricted-imports
import { hydrateUnit } from '@decipad/computer';

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
  importExternalData: (_store, [options]) => {
    for (const k of Object.keys(options.metaColumnOptions)) {
      const t = options.metaColumnOptions[k];
      // eslint-disable-next-line no-param-reassign
      options.metaColumnOptions[k] = t && {
        ...t,
        unit: t.unit && t.unit.map(hydrateUnit),
      };
    }
    return [options];
  },
  releaseExternalData: noChangeArgEncoder,
  waitForTriedCache: noChangeArgEncoder,
  setTriedCache: noChangeArgEncoder,
};

export const createRPCWorkerArgDecoder = <TMethodName extends RPCMethodName>(
  methodName: TMethodName
): TRPCArgDecoder<TMethodName> => argDecoders[methodName];
