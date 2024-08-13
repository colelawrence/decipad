// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import type {
  BlockResult,
  IdentifiedError,
} from '@decipad/computer-interfaces';
import { encodeType } from '@decipad/remote-computer-codec';
import type { RemoteValueStore } from '@decipad/remote-computer-worker/client';
import { createValueEncoder } from '@decipad/remote-computer-worker/worker';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import type { SerializedBlockResult } from '../types/serializedTypes';
import { encodeBracketError } from './encodeBracketError';
import { encodeMooToken } from './encodeMooToken';
import { encodeResultMeta } from './encodeResultMeta';

export const encodeBlockResult = async (
  result: BlockResult | undefined,
  store: RemoteValueStore
): Promise<SerializedBlockResult | undefined> => {
  if (!result) {
    return result;
  }
  if (result.type === 'computer-result') {
    const encodeResult = createValueEncoder(store);

    const typeBuffer = new Value.GrowableDataView(
      createResizableArrayBuffer(1024)
    );
    const typeSize = encodeType(typeBuffer, 0, result.result.type);
    return {
      ...result,
      result: {
        type: typeBuffer.seal(typeSize),
        value: await encodeResult(result.id, result.result),
        meta: await encodeResultMeta(result.result.meta),
      },
    };
  }
  if (
    result.type === 'identified-error' &&
    result.errorKind === 'parse-error'
  ) {
    return {
      ...result,
      error: {
        ...result.error,
        token: result.error?.token
          ? encodeMooToken(result.error.token)
          : undefined,
        bracketError: result.error.bracketError
          ? encodeBracketError(result.error.bracketError)
          : undefined,
      },
    } as IdentifiedError;
  }
  return result;
};
