import { MyEditor } from '@decipad/editor-types';
import { getEditorString } from '@udecode/plate';
import { BasePoint } from 'slate';

export const getTextBeforeCursor = (editor: MyEditor, cursor: BasePoint) =>
  getEditorString(editor, {
    anchor: { path: cursor.path, offset: 0 },
    focus: { path: cursor.path, offset: cursor.offset },
  });
