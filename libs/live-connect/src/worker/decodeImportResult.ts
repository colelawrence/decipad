import type { ImportResult } from '@decipad/import';
import {
  decodeResult,
  decodeString,
  decoders,
} from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import { SerializedImportResult } from './types';

export const decodeImportResult = async (
  importResult: SerializedImportResult
): Promise<ImportResult> => {
  const result: ImportResult = {};
  const buffer = importResult;
  const dataView = new DataView(buffer);
  let offset = 0;

  // result.meta
  const hasMeta = dataView.getUint8(offset);
  offset += 1;
  if (hasMeta) {
    const [encodedMeta, newOffset] = decodeString(dataView, offset);
    result.meta = JSON.parse(encodedMeta);
    offset = newOffset;
  }

  // result.rawResult
  const hasRawResult = dataView.getUint8(offset);
  offset += 1;
  if (hasRawResult) {
    const [encodeRawResult, newOffset] = decodeString(dataView, offset);
    result.rawResult = JSON.parse(encodeRawResult);
    offset = newOffset;
  }

  // result.result
  const hasResult = dataView.getUint8(offset);
  offset += 1;
  if (hasResult) {
    const [innerResult, newOffset] = await decodeResult(
      dataView,
      offset,
      decoders
    );
    result.result = innerResult;
    offset = newOffset;
  }
  return result;
};
