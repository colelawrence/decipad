import { MyEditor, MyElement } from '@decipad/editor-types';
import { findColumnByCell } from '@decipad/editor-table';
import { CellDndProps } from '../contexts/TableDndContext';

export const findColumnAndDragItem = (
  editor: MyEditor,
  table: MyElement,
  { dragItem: dragItemCell, cell }: CellDndProps
) => {
  const column = findColumnByCell(editor, table, cell);
  const dragItem = findColumnByCell(editor, table, dragItemCell);

  if (!column) return;
  if (!dragItem) return;

  const swapCtx = {
    editor,
    table,
    column,
  };

  return { column, dragItem, swapCtx };
};
