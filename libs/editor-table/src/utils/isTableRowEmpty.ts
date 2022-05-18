import { Path } from 'slate';
import { getNodeChildren, getNodeString } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';

export const isTableRowEmpty = (
  editor: MyEditor,
  tablePath: Path,
  rowIndex: number
): boolean => {
  const rowPath = [...tablePath, rowIndex + 2];
  for (const [td] of getNodeChildren(editor, rowPath)) {
    if (getNodeString(td).length > 0) {
      return false;
    }
  }
  return true;
};
