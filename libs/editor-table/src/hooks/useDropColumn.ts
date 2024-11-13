import { useContext } from 'react';
import { useDrop } from 'react-dnd';
import {
  DRAG_ITEM_COLUMN,
  type ColumnDndDirection,
  type DragColumnItem,
  type MyEditor,
  type MyElement,
} from '@decipad/editor-types';

import { getHoverDirection } from '@decipad/editor-utils';
import { TableDndContext } from '@decipad/react-contexts';

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
