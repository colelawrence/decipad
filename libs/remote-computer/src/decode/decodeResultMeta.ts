import type { Result } from '@decipad/language-interfaces';
import { decodeString } from '@decipad/remote-computer-codec';

export const decodeResultMeta = (
  buffer: ArrayBuffer
): Result.Result['meta'] => {
  let offset = 0;
  const view = new DataView(buffer);
  const labelGroupCount = view.getUint32(offset);
  offset += 4;

  const labelGroups: string[][] = [];

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

  const meta = () => ({ labels: Promise.resolve(labelGroups) });

  return meta;
};
