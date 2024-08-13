import type { Result } from '@decipad/language-interfaces';
import { decodeString } from './decodeString';

export const decodeResultMeta = async (
  view: DataView,
  _offset: number
): Promise<[Result.Result['meta'], number]> => {
  let offset = _offset;
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

  return [meta, offset];
};
