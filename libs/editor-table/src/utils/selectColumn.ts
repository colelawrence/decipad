import { ELEMENT_TABLE, MyEditor, TableElement } from '@decipad/editor-types';
import { Path } from 'slate';
import {
  getAboveNode,
  getEndPoint,
  getStartPoint,
  select,
} from '@udecode/plate';

export const selectColumn = (editor: MyEditor, cellPath: Path) => {
  const tableEntry = getAboveNode<TableElement>(editor, {
    at: cellPath,
    match: { type: ELEMENT_TABLE },
  });
  if (!tableEntry) return;

  const colIndex = cellPath[cellPath.length - 1];

  const [tableNode, tablePath] = tableEntry;

  select(editor, {
    anchor: getStartPoint(editor, [...tablePath, 2, colIndex]),
    focus: getEndPoint(editor, [
      ...tablePath,
      tableNode.children.length - 1,
      colIndex,
    ]),
  });
};
