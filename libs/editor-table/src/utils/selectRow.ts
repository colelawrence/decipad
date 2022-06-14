import { MyEditor } from '@decipad/editor-types';
import { Path } from 'slate';
import { select } from '@udecode/plate';

export const selectRow = (editor: MyEditor, rowPath: Path) => {
  select(editor, rowPath);
};
