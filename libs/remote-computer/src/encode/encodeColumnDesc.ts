import type { ColumnDesc } from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { encodeType } from '@decipad/remote-computer-codec';
import type { RemoteValueStore } from '@decipad/remote-computer-worker/client';
import { encodeMaybe } from './encodeMaybe';
import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import type { SerializedColumnDesc } from '../types/serializedTypes';
import { createResultEncoder } from './createResultEncoder';

export const encodeColumnDesc = async (
  columnDesc: ColumnDesc,
  store: RemoteValueStore
): Promise<SerializedColumnDesc> => {
  const blockTypeBuffer = new Value.GrowableDataView(
    createResizableArrayBuffer(1024)
  );
  const blockTypeBufferLength = encodeMaybe(
    blockTypeBuffer,
    0,
    columnDesc.blockType,
    encodeType
  );
  const encodeResult = createResultEncoder(store);
  return {
    ...columnDesc,
    blockType: blockTypeBuffer.seal(blockTypeBufferLength),
    result: await encodeResult(columnDesc.result as Result.AnyResult),
  };
};
