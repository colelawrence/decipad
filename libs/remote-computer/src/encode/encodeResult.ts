import { Unknown, type Result } from '@decipad/language-interfaces';
import { encodeType, valueEncoder } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import type { SerializedResult } from '../types/serializedTypes';

export const encodeResult = async (
  result: Result.Result
): Promise<SerializedResult> => {
  const { type, value } = result;
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
