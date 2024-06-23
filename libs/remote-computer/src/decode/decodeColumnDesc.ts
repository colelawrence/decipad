import type { SerializedType, Result } from '@decipad/language-interfaces';
import type { ColumnDesc } from '@decipad/computer-interfaces';
import { type ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import { decodeType } from '@decipad/remote-computer-codec';
import { decodeMaybe } from './decodeMaybe';
import { createResultDecoder } from './createResultDecoder';
import type { SerializedColumnDesc } from '../types/serializedTypes';

export const decodeColumnDesc = async (
  context: ClientWorkerContext,
  value: SerializedColumnDesc
): Promise<ColumnDesc> => {
  const blockType: SerializedType | undefined = await decodeMaybe(
    new DataView(value.blockType),
    0,
    (buffer, offset) => decodeType(buffer, offset)[0]
  );
  const decodeResult = createResultDecoder(context);
  const result = await decodeResult(value.result);
  return {
    ...value,
    blockType,
    result: result as Result.Result<'column'>,
  };
};
