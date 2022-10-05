import { MyEditor } from '@decipad/editor-types';
import { getRange } from '@udecode/plate';
import { BaseRange, Location } from 'slate';

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
