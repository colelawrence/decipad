/* eslint-disable no-underscore-dangle */
import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { encodeType } from '@decipad/remote-computer-codec';
import type { RemoteValueStore } from '@decipad/remote-computer-worker/client';
import { createValueEncoder } from '@decipad/remote-computer-worker/worker';
import type { SerializedResult } from '../types/serializedTypes';
import { WithEncoded } from '../types/WithEncoded';

export const createResultEncoder = (store: RemoteValueStore) => {
  const encodeValue = createValueEncoder(store);
  return async (
    result: WithEncoded<Result.Result, SerializedResult>
  ): Promise<SerializedResult> => {
    if (result.__encoded) {
      return result.__encoded;
    }
    const typeBuffer = new Value.GrowableDataView(
      createResizableArrayBuffer(1024)
    );
    const typeLength = encodeType(typeBuffer, 0, result.type);
    return {
      type: typeBuffer.seal(typeLength),
      value: await encodeValue(result),
    };
  };
};
