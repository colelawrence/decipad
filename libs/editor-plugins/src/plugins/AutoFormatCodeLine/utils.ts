import { MyGenericEditor } from '@decipad/editor-types';
import { Value, getEditorString } from '@udecode/plate';
import { BasePoint } from 'slate';

export const getTextBeforeCursor = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  editor: TE,
  cursor: BasePoint
) =>
  getEditorString(editor, {
    anchor: { path: cursor.path, offset: 0 },
    focus: { path: cursor.path, offset: cursor.offset },
  });
