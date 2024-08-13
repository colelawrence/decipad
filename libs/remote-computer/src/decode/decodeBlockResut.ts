// eslint-disable-next-line no-restricted-imports
import isArrayBuffer from 'lodash/isArrayBuffer';
import type {
  BlockResult,
  IdentifiedError,
} from '@decipad/computer-interfaces';
import type { Result, Parser } from '@decipad/language-interfaces';
import { decodeType } from '@decipad/remote-computer-codec';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import {
  decodeMetaLabels,
  decodeRemoteValue,
} from '@decipad/remote-computer-worker/client';
import type { SerializedBlockResult } from '../types/serializedTypes';
import { decodeMooToken } from './decodeMooToken';
import { decodeBracketError } from './decodeBracketError';
import { debug } from '../debug';

export const decodeBlockResult = async (
  context: ClientWorkerContext,
  blockResult?: SerializedBlockResult
): Promise<BlockResult | undefined> => {
  if (blockResult == null) {
    return blockResult;
  }
  if (blockResult?.type === 'computer-result') {
    const { type, value, meta: inlinedMeta } = blockResult.result;
    const [decodedType] = decodeType(new DataView(type), 0);
    const [resultValue, , valueId] = await decodeRemoteValue(
      context,
      new DataView(value),
      0,
      decodedType
    );

    return {
      ...blockResult,
      result: {
        type: decodedType,
        value: resultValue,
        meta: (): Result.ResultMetadata => {
          if (inlinedMeta != null) {
            return {
              labels: Promise.resolve(decodeMetaLabels(inlinedMeta)),
            };
          }
          if (!valueId) {
            return undefined;
          }

          debug('going to call RPC for getting meta for value', valueId);
          return {
            labels: context.rpc
              .call('getMeta', { valueId })
              .then((meta) => {
                if (!meta) {
                  return [];
                }
                if (!isArrayBuffer(meta)) {
                  throw new TypeError(
                    'Expected ArrayBuffer as remote `getValue()` return type'
                  );
                }
                return decodeMetaLabels(meta);
              })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('Error getting meta', error);
                return [];
              }),
          };
        },
      },
    };
  }
  if (
    blockResult?.type === 'identified-error' &&
    blockResult.errorKind === 'parse-error'
  ) {
    return {
      ...blockResult,
      errorKind: 'parse-error',
      error: {
        ...blockResult.error,
        token: blockResult.error?.token
          ? decodeMooToken(blockResult.error.token)
          : undefined,
        bracketError: blockResult.error?.bracketError
          ? decodeBracketError(blockResult.error.bracketError)
          : undefined,
      } as Parser.ParserError,
    } as IdentifiedError;
  }
  return blockResult as BlockResult;
};
