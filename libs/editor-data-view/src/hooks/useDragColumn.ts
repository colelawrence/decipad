import { useDrag } from 'react-dnd';
import { TEditor } from '@udecode/plate';
import { DragColumnItem } from '@decipad/editor-table';

interface CollectedProps {
  isDragging: boolean;
}

export type ColumnType = 'TableColumn' | 'DataViewColumn';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDragColumn = (
  _editor: TEditor,
  id: string,
  columnType: ColumnType = 'TableColumn'
) => {
  return useDrag<DragColumnItem, void, CollectedProps>(
    () => ({
      type: columnType,
      item() {
        return { id };
      },
      collect: (monitor): CollectedProps => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        // do nothing for now
      },
    }),
    []
  );
};
