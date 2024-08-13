/* eslint-disable no-restricted-imports */
import { Result } from '@decipad/language-interfaces';
import { Value } from '@decipad/language-types';
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { encodeString } from '@decipad/remote-computer-codec';

export const encodeMetaLabels = (
  labels: Awaited<Result.ResultMetadataColumn['labels']>
): ArrayBuffer => {
  const buffer = createResizableArrayBuffer();
  const view = new Value.GrowableDataView(buffer);
  let offset = 0;
  const labelCount = labels?.length ?? 0;
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
