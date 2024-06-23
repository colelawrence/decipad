import { type Result } from '@decipad/language-interfaces';
import {
  decodeRemoteValue,
  type ClientWorkerContext,
} from '@decipad/remote-computer-worker/client';
import { decodeType } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import type { SerializedResult } from '../types/serializedTypes';

const getDataView = (buffer: ArrayBuffer): DataView => {
  try {
    return new DataView(buffer);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating DataView from buffer', error);
    throw error;
  }
};

export const createResultDecoder = (context: ClientWorkerContext) => {
  return async (result: SerializedResult): Promise<Result.Result> => {
    const { type: typeBuffer, value: valueBuffer } = result;
    const typeView = getDataView(typeBuffer);
    const [type] = decodeType(typeView, 0);

    const valueView = getDataView(valueBuffer);
    const [value] = await decodeRemoteValue(context, valueView, 0, type);

    return {
      type,
      value,
    };
  };
};
