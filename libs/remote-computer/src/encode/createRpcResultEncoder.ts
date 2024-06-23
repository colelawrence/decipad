import { identity } from '@decipad/utils';
import type { TRPCResultEncoder, TRPCResultEncoders } from '../types/rpc';
import { encodeResult } from './encodeResult';
import { encodeSerializedType } from './encodeSerializedType';
import { encodeUnit } from './encodeUnit';
import { encodeNotebookResults } from './encodeNotebookResults';
import { encodeAutoCompleteNames } from './encodeAutoCompleteNames';

export const resultEncoders: TRPCResultEncoders = {
  expressionResult: encodeResult,
  getStatement: identity,
  getSymbolDefinedInBlock: identity,
  variableExists: identity,
  getAvailableIdentifier: identity,
  getNamesDefined: encodeAutoCompleteNames,
  expressionType: encodeSerializedType,
  pushComputeDelta: identity,
  computeDeltaRequest: (result, store) =>
    result ? encodeNotebookResults(result, store) : result,
  getUnitFromText: (unit) => unit?.map(encodeUnit) ?? null,
  flush: identity,
  terminate: identity,
};

export const createRpcResultEncoder = <
  TMethodName extends keyof TRPCResultEncoders
>(
  methodName: TMethodName
): TRPCResultEncoder<TMethodName> => resultEncoders[methodName];
