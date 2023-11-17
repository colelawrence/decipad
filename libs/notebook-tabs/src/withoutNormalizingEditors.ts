import { TEditor, withoutNormalizing } from '@udecode/plate';

export const withoutNormalizingEditors = (
  editors: TEditor[],
  cb: () => void
) => {
  editors.reduce(
    (callback, subEditor) => () => withoutNormalizing(subEditor, callback),
    cb
  )();
};
