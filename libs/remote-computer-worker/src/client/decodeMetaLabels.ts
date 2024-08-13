/* eslint-disable no-restricted-imports */
import { Result } from '@decipad/language-interfaces';
import { decodeString } from '@decipad/remote-computer-codec';
import { isArrayBuffer } from '../utils/isArrayBuffer';

export const decodeMetaLabels = (
  encoded: ArrayBuffer
): NonNullable<Awaited<Result.ResultMetadataColumn['labels']>> => {
  if (!isArrayBuffer(encoded)) {
    // eslint-disable-next-line no-console
    console.warn('Expected ArrayBuffer', encoded);
    throw new TypeError('Expected ArrayBuffer');
  }
  const view = new DataView(encoded);
  let offset = 0;
  const labelGroupCount = view.getUint32(offset);
  offset += 4;

  const labelGroups = [];

  for (let i = 0; i < labelGroupCount; i++) {
    const subLabelGroups = [];
    const subGroupLabelCount = view.getUint32(offset);
    offset += 4;

    for (let j = 0; j < subGroupLabelCount; j++) {
      const [label, newOffset] = decodeString(view, offset);
      subLabelGroups.push(label);
      offset = newOffset;
    }
    labelGroups.push(subLabelGroups);
  }

  return labelGroups;
};
