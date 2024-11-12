import { TEditor, withoutNormalizing } from '@udecode/plate-common';
import { BaseEditor } from 'slate';

export const withoutNormalizingEditors = (
  editors: Array<BaseEditor | TEditor>,
  cb: () => void
) => {
  editors.reduce(
    (callback, subEditor) => () =>
      withoutNormalizing(subEditor as TEditor, callback),
    cb
  )();
};
