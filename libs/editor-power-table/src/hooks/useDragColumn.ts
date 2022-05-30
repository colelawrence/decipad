import { useDrag } from 'react-dnd';
import { TEditor } from '@udecode/plate';
import { DragColumnItem } from '@decipad/editor-table';

interface CollectedProps {
  isDragging: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDragColumn = (_editor: TEditor, id: string) => {
  return useDrag<DragColumnItem, void, CollectedProps>(
    () => ({
      type: 'column',
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
