import { type MyEditor } from '@decipad/editor-types';
import { getRange } from '@udecode/plate-common';
import { type BaseRange, type Location } from 'slate';

export const getRangeSafe = (
  editor: MyEditor,
  at: Location
): BaseRange | undefined => {
  try {
    return getRange(editor, at);
  } catch (err) {
    // ignore
  }
  return undefined;
};
