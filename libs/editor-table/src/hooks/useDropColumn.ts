import { useContext } from 'react';
import { useDrop } from 'react-dnd';
import { MyEditor, MyElement } from '@decipad/editor-types';

import { getHoverDirection } from '../utils';
import { ColumnDndDirection, DragColumnItem } from '../types';
import { DRAG_ITEM_COLUMN, TableDndContext } from '../contexts/TableDndContext';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
}

export const useDropColumn = (editor: MyEditor, cell: MyElement) => {
  const tableDnd = useContext(TableDndContext);

  return useDrop<DragColumnItem, void, CollectedProps>({
    accept: DRAG_ITEM_COLUMN,
    hover: (dragItem, monitor) =>
      tableDnd.onCellHover({ dragItem, monitor, cell }),
    drop: (dragItem, monitor) =>
      tableDnd.onCellDrop({ dragItem, monitor, cell }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      overDirection:
        (monitor.isOver() &&
          getHoverDirection(editor, { monitor, element: cell })) ||
        undefined,
    }),
  });
};
