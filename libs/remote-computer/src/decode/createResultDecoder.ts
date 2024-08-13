import { type Result } from '@decipad/language-interfaces';
import {
  decodeRemoteValue,
  type ClientWorkerContext,
} from '@decipad/remote-computer-worker/client';
import { decodeType } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import type { SerializedResult } from '../types/serializedTypes';
import { WithEncoded } from '../types/WithEncoded';
import { decodeResultMeta } from './decodeResultMeta';

export const createResultDecoder = (context: ClientWorkerContext) => {
  return async (
    result: SerializedResult
  ): Promise<WithEncoded<Result.Result, SerializedResult>> => {
    const { type: typeBuffer, value: valueBuffer, meta: metaBuffer } = result;
    const typeView = new DataView(typeBuffer);
    const [type] = decodeType(typeView, 0);

    const valueView = new DataView(valueBuffer);
    const [value] = await decodeRemoteValue(context, valueView, 0, type);

    return {
      __encoded: result,
      type,
      value,
      meta: metaBuffer ? decodeResultMeta(metaBuffer) : undefined,
    };
  };
};
