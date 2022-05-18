import { useDrag } from 'react-dnd';
import { MyEditor } from '@decipad/editor-types';
import { DragColumnItem } from '../types';

interface CollectedProps {
  isDragging: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDragColumn = (_editor: MyEditor, id: string) => {
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
