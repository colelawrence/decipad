import { MyEditor } from '@decipad/editor-types';
import { findColumnByCell } from '@decipad/editor-table';
import { Path } from 'slate';
import { CellDndProps } from '../contexts/TableDndContext';

export const findColumnAndDragItem = (
  editor: MyEditor,
  tablePath: Path | undefined,
  { dragItem: dragItemCell, cell }: CellDndProps
) => {
  const column = findColumnByCell(editor, tablePath, cell);
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
