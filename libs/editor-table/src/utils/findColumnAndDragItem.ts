import type { Path } from 'slate';
import { isElement } from '@udecode/plate-common';
import type { MyEditor } from '@decipad/editor-types';
import { findColumnByCell } from './findColumnByCell';
import { CellDndProps } from '@decipad/react-contexts';

export const findColumnAndDragItem = (
  editor: MyEditor,
  tablePath: Path | undefined,
  { dragItem: dragItemCell, cell }: CellDndProps
) => {
  const column = isElement(cell) && findColumnByCell(editor, tablePath, cell);
  const dragItem = findColumnByCell(editor, tablePath, dragItemCell);

  if (!column) return;
  if (!dragItem) return;

  const swapCtx = {
    editor,
    tablePath,
    column,
  };

  return { column, dragItem, swapCtx };
};
