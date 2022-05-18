import { Path } from 'slate';
import {
  getNodeChildren,
  getNodeEntry,
  getNodeString,
  hasNode,
} from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';

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
      const [cell] = getNodeEntry(editor, cellPath);
      if (getNodeString(cell).length > 0) {
        return false;
      }
    }
  }
  return true;
};
