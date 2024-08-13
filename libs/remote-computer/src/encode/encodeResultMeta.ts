import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { encodeString } from '@decipad/remote-computer-codec';

const emptyLabelMeta = () => ({
  labels: undefined,
});

export const encodeResultMeta = async (
  meta: Result.Result['meta']
): Promise<ArrayBuffer | undefined> => {
  if (!meta) {
    return encodeResultMeta(emptyLabelMeta);
  }

  const view = new Value.GrowableDataView(createResizableArrayBuffer(1024));
  let offset = 0;
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

  return view.seal(offset);
};
