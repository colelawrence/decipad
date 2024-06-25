// eslint-disable-next-line no-restricted-imports
import type { BlockResult } from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  encodeResult,
  encodeString,
  recursiveEncoders,
} from '@decipad/remote-computer-codec';
import stringify from 'json-stringify-safe';

export const encodeFullBlockResult = async (
  buffer: DataView,
  _offset: number,
  blockResult: BlockResult
): Promise<number> => {
  let offset = _offset;
  if (blockResult.type === 'computer-result') {
    buffer.setUint8(_offset, 0);
    offset += 1;
    const { result, visibleVariables, ...rest } = blockResult;

    // rest
    offset = encodeString(buffer, offset, stringify(rest));

    // visibleVariables
    if (visibleVariables) {
      buffer.setUint8(offset, 1);
      offset += 1;
      const { global, local } = visibleVariables;
      offset = encodeString(buffer, offset, stringify(Array.from(global)));
      offset = encodeString(buffer, offset, stringify(Array.from(local)));
    } else {
      buffer.setUint8(offset, 0);
      offset += 1;
    }

    // result
    offset = await encodeResult(buffer, offset, result, recursiveEncoders);
    return offset;
  }
  buffer.setUint8(_offset, 1);
  offset += 1;
  return encodeString(buffer, offset, stringify(blockResult));
};
