// eslint-disable-next-line no-restricted-imports

import type { BlockResult } from '@decipad/computer-interfaces';
import {
  decodeResult,
  decodeString,
  decoders,
} from '@decipad/remote-computer-codec';

export const decodeFullBlockResult = async (
  buffer: DataView,
  _offset: number
): Promise<[BlockResult, number]> => {
  let offset = _offset;
  const resultType = buffer.getUint8(offset);
  offset += 1;
  if (resultType === 0) {
    // computer-result

    // rest
    const [encodedRest, newOffset] = decodeString(buffer, offset);
    offset = newOffset;
    const rest = JSON.parse(encodedRest);

    // visibleVariables
    const hasVisibleVariables = buffer.getUint8(offset);
    offset += 1;
    let visibleVariables: BlockResult['visibleVariables'];
    if (hasVisibleVariables === 1) {
      const [globalVisibleEncoded, newOffset2] = decodeString(buffer, offset);
      offset = newOffset2;
      const globalVisible = JSON.parse(globalVisibleEncoded);
      const [localVisibleEncoded, newOffset3] = decodeString(buffer, offset);
      offset = newOffset3;
      const localVisible = JSON.parse(localVisibleEncoded);
      visibleVariables = {
        global: new Set(globalVisible),
        local: new Set(localVisible),
      };
    }

    // result
    const [result, newOffset4] = await decodeResult(buffer, offset, decoders);
    offset = newOffset4;

    return [
      {
        visibleVariables,
        result,
        ...rest,
      },
      offset,
    ];
  }
  const [encoded, newOffset] = decodeString(buffer, offset);
  offset = newOffset;
  return [JSON.parse(encoded), offset];
};
