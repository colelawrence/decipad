import { MyEditor, MyElement } from '@decipad/editor-types';
import { findNodePath, getNodeChildren } from '@udecode/plate';
import { DragColumnItem } from '../types';

export const findColumnByCell = (
  editor: MyEditor,
  table: MyElement,
  cell: DragColumnItem
): MyElement | null => {
  const path = findNodePath(editor, table);
  if (!path) return null;

  const children = Array.from(getNodeChildren(editor, path));
  const firstRow = children[1];

  if (!firstRow) return null;

  const colHeaderElements: Record<number, MyElement> = {};

  Array.from(getNodeChildren(editor, firstRow[1])).forEach(([r], idx) => {
    colHeaderElements[idx] = r;
  });

  const colIdx = children
    .map(([, rowPath]) => {
      const cells = Array.from(getNodeChildren(editor, rowPath));
      return cells.findIndex(([c, _p]) => c.id === cell.id);
    })
    .find((e) => e >= 0);

  if (colIdx == null) return null;

  return colHeaderElements[colIdx];
};
