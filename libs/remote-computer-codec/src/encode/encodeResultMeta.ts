import type { Result } from '@decipad/language-interfaces';
import { encodeString } from './encodeString';

export const encodeResultMeta = async (
  view: DataView,
  _offset: number,
  meta: Result.Result['meta']
): Promise<number> => {
  let offset = _offset;
  const labels = (await meta?.()?.labels) ?? [];
  const labelCount = labels.length ?? 0;
  view.setUint32(offset, labelCount);
  offset += 4;

  for (const labelGroup of labels ?? []) {
    const labelLength = labelGroup?.length ?? 0;
    view.setUint32(offset, labelLength);
    offset += 4;

    for (const label of labelGroup ?? []) {
      offset = encodeString(view, offset, label);
    }
  }

  return offset;
};
