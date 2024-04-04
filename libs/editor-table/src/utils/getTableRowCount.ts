import type { Path } from 'slate';
import { getNodeChildren } from '@udecode/plate-common';
import type { MyEditor } from '@decipad/editor-types';

export const getTableRowCount = (editor: MyEditor, tablePath: Path): number => {
  return Array.from(getNodeChildren(editor, tablePath)).length - 2;
};
