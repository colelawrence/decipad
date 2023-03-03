import { ELEMENT_TABLE, MyEditor, TableElement } from '@decipad/editor-types';
import { Path } from 'slate';
import { getEndPoint, getStartPoint, select } from '@udecode/plate';
import { getAboveNodeSafe } from '@decipad/editor-utils';

export const selectColumn = (editor: MyEditor, cellPath: Path) => {
  const tableEntry = getAboveNodeSafe<TableElement>(editor, {
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
