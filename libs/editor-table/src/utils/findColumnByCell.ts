import { MyEditor, MyElement } from '@decipad/editor-types';
import { getNodeChildren } from '@udecode/plate';
import { Path } from 'slate';
import { DragColumnItem } from '../types';

export const findColumnByCell = (
  editor: MyEditor,
  tablePath: Path | undefined,
  cell: DragColumnItem
): MyElement | null => {
  if (!tablePath) return null;

  const children = Array.from(getNodeChildren(editor, tablePath));
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
