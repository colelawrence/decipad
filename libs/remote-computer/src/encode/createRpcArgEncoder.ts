import { identity } from '@decipad/utils';
import type {
  RPCMethodName,
  TRPCArgEncoder,
  TRPCArgEncoders,
} from '../types/rpc';
import { encodeComputeDeltaRequest } from './encodeComputeDeltaRequest';
import { encodeAST } from './encodeAST';

export const argEncoders: TRPCArgEncoders = {
  expressionResult: ([exp]) => [encodeAST(exp)],
  getStatement: identity,
  variableExists: identity,
  getAvailableIdentifier: identity,
  getSymbolDefinedInBlock: identity,
  getNamesDefined: identity,
  expressionType: ([exp]) => [encodeAST(exp)],
  pushComputeDelta: async ([req]) => [await encodeComputeDeltaRequest(req)],
  computeDeltaRequest: async ([req]) => [await encodeComputeDeltaRequest(req)],
  getUnitFromText: identity,
  flush: identity,
  terminate: identity,
  importExternalData: identity,
  releaseExternalData: identity,
  waitForTriedCache: identity,
  setTriedCache: identity,
};

export const createRPCArgEncoder = <TMethodName extends RPCMethodName>(
  methodName: TMethodName
): TRPCArgEncoder<TMethodName> => argEncoders[methodName];
