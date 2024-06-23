import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import type {
  RPCMethodName,
  TRPCResultDecoder,
  TRPCResultDecoders,
} from '../types/rpc';
import { decodeRootResult } from './decodeResult';
import { decodeSerializedType } from './decodeSerializedType';
import { decodeNotebookResults } from './decodeNotebookResults';
import { decodeUnit } from './decodeUnit';
import { decodeAutoCompleteNames } from './decodeAutocompleteNameArray';

const noopDecoder = <T>(_context: ClientWorkerContext, value: T): T => value;

export const resultDecoders: TRPCResultDecoders = {
  expressionResult: async (context, result) =>
    decodeRootResult(context, result),
  getStatement: noopDecoder,
  getSymbolDefinedInBlock: noopDecoder,
  variableExists: noopDecoder,
  getAvailableIdentifier: noopDecoder,
  getNamesDefined: decodeAutoCompleteNames,
  expressionType: (_context, type) => decodeSerializedType(type),
  pushComputeDelta: noopDecoder,
  computeDeltaRequest: (context, results) =>
    results ? decodeNotebookResults(context, results) : results,
  getUnitFromText: (_context, unit) =>
    unit != null ? unit.map(decodeUnit) : unit,
  flush: noopDecoder,
  terminate: noopDecoder,
};

export const createRPCResultDecoder = <TMethodName extends RPCMethodName>(
  methodName: TMethodName
): TRPCResultDecoder<TMethodName> => resultDecoders[methodName];
