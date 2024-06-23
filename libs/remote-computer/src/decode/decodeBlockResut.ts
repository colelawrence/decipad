// eslint-disable-next-line no-restricted-imports

import type {
  BlockResult,
  IdentifiedError,
} from '@decipad/computer-interfaces';
import { decodeType } from '@decipad/remote-computer-codec';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import { decodeRemoteValue } from '@decipad/remote-computer-worker/client';
import type { SerializedBlockResult } from '../types/serializedTypes';
import type { Parser } from '@decipad/language-interfaces';
import { decodeMooToken } from './decodeMooToken';
import { decodeBracketError } from './decodeBracketError';

export const decodeBlockResult = async (
  context: ClientWorkerContext,
  blockResult?: SerializedBlockResult
): Promise<BlockResult | undefined> => {
  if (blockResult == null) {
    return blockResult;
  }
  if (blockResult?.type === 'computer-result') {
    const { type, value } = blockResult.result;
    const [decodedType] = decodeType(new DataView(type), 0);
    const [resultValue] = await decodeRemoteValue(
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
