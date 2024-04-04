import type { TEditor } from '@udecode/plate-common';
import { withoutNormalizing } from '@udecode/plate-common';

export const withoutNormalizingEditors = (
  editors: TEditor[],
  cb: () => void
) => {
  editors.reduce(
    (callback, subEditor) => () => withoutNormalizing(subEditor, callback),
    cb
  )();
};
