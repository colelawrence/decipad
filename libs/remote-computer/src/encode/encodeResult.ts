/* eslint-disable no-underscore-dangle */
import { Unknown, type Result } from '@decipad/language-interfaces';
import { encodeType, valueEncoder } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import type { SerializedResult } from '../types/serializedTypes';
import { WithEncoded } from '../types/WithEncoded';

export const encodeResult = async (
  result: WithEncoded<Result.Result, SerializedResult>
): Promise<SerializedResult> => {
  const { type, value, __encoded } = result;
  if (__encoded) {
    return __encoded;
  }
  const typeBuffer = new Value.GrowableDataView(
    createResizableArrayBuffer(1024)
  );
  const typeLength = await encodeType(typeBuffer, 0, type);

  const valueBuffer = new Value.GrowableDataView(
    createResizableArrayBuffer(1024)
  );
  const encodeValue = valueEncoder(type);
  const valueLength = await encodeValue(valueBuffer, 0, value ?? Unknown);

  return {
    type: typeBuffer.seal(typeLength),
    value: valueBuffer.seal(valueLength),
  };
};
