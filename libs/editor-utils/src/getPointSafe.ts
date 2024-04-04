import { type MyEditor } from '@decipad/editor-types';
import { getPoint } from '@udecode/plate-common';
import { type EditorPointOptions, type Location } from 'slate';

export const getPointSafe = (
  editor: MyEditor,
  at: Location,
  options?: EditorPointOptions | undefined
) => {
  try {
    return getPoint(editor, at, options);
  } catch (err) {
    return undefined;
  }
};
