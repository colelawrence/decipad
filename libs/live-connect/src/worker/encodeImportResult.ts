import type { ImportResult } from '@decipad/import';
import {
  encodeResult,
  encodeString,
  recursiveEncoders,
} from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { SerializedImportResult } from './types';
import stringify from 'json-stringify-safe';

export const encodeImportResult = async (
  result: ImportResult
): Promise<SerializedImportResult> => {
  const buffer = createResizableArrayBuffer(1024);
  const dataView = new Value.GrowableDataView(buffer);
  let offset = 0;

  // result.meta
  if (result.meta) {
    dataView.setUint8(offset, 1);
    offset += 1;
    offset = encodeString(dataView, offset, stringify(result.meta));
  } else {
    dataView.setUint8(offset, 0);
    offset += 1;
  }

  // result.rawResult
  if (result.rawResult) {
    dataView.setUint8(offset, 1);
    offset += 1;
    const encodedRawResult = stringify(result.rawResult);
    offset = encodeString(dataView, offset, encodedRawResult);
  } else {
    dataView.setUint8(offset, 0);
    offset += 1;
  }

  // result.result
  if (result.result) {
    dataView.setUint8(offset, 1);
    offset += 1;
    offset = await encodeResult(
      dataView,
      offset,
      result.result,
      recursiveEncoders
    );
  } else {
    dataView.setUint8(offset, 0);
    offset += 1;
  }
  return dataView.seal(offset);
};
