import { Path } from 'slate';
import { getNodeChildren, getNodeString, hasNode } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';
import { getNodeEntrySafe } from '@decipad/editor-utils';

export const isTableColumnEmpty = (
  editor: MyEditor,
  tablePath: Path,
  columnIndex: number
): boolean => {
  let childIndex = -1;
  for (const [, rowPath] of getNodeChildren(editor, tablePath)) {
    childIndex += 1;
    if (childIndex < 2) {
      continue;
    }
    const cellPath = [...rowPath, columnIndex];
    if (hasNode(editor, cellPath)) {
      const cellEntry = getNodeEntrySafe(editor, cellPath);
      if (!cellEntry) {
        return false;
      }
      const [cell] = cellEntry;
      if (getNodeString(cell).length > 0) {
        return false;
      }
    }
  }
  return true;
};
