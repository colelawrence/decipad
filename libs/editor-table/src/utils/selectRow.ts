import type { MyEditor } from '@decipad/editor-types';
import type { Path } from 'slate';
import { select } from '@udecode/plate-common';

export const selectRow = (editor: MyEditor, rowPath: Path) => {
  select(editor, rowPath);
};
