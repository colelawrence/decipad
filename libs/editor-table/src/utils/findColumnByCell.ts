import {
  ELEMENT_TR,
  MyEditor,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { getNodeChildren, isElement } from '@udecode/plate';
import { Path } from 'slate';
import { DragColumnItem } from '../types';

export const findColumnByCell = (
  editor: MyEditor,
  tablePath: Path | undefined,
  cell: DragColumnItem
): TableHeaderElement | null => {
  if (!tablePath) return null;

  const children = Array.from(
    getNodeChildren<TableElement['children'][number]>(editor, tablePath)
  );
  const firstRow = children[1];

  if (!firstRow) return null;
  const [firstRowNode, firstRowPath] = firstRow;
  if (!isElement(firstRowNode) || firstRowNode.type !== ELEMENT_TR) {
    return null;
  }

  const colIdx = children
    .map(([tableChild, rowPath]) => {
      if (!isElement(tableChild)) {
        return undefined;
      }
      const cells = Array.from(getNodeChildren(editor, rowPath));
      return cells.findIndex(([c, _p]) => c.id === cell.id);
    })
    .find((e) => e != null && e >= 0);

  if (colIdx == null) return null;

  const colHeaderElements = Array.from(
    getNodeChildren<TableHeaderElement>(editor, firstRowPath)
  ).map(([r]) => r);

  return colHeaderElements[colIdx];
};
