import { MyPlatePlugin } from '@decipad/editor-types';
import { cssVar } from '@decipad/ui';
import { findEventRange } from '@udecode/plate';
import { cursorStore } from '../../stores/cursorStore';

export const createDragOverCursorPlugin = (): MyPlatePlugin => ({
  key: 'drag-over-cursor',
  handlers: {
    onDragOver: (editor) => (event) => {
      if (editor.isDragging) return;

      const range = findEventRange(editor, event);
      if (!range) return;

      cursorStore.set.cursors({
        drag: {
          key: 'drag',
          data: {
            style: {
              backgroundColor: cssVar('droplineColor'),
              width: 2,
            },
          },
          selection: range,
        },
      });
    },
    onDragLeave: () => () => {
      cursorStore.set.cursors({});
    },
    onDragEnd: () => () => {
      cursorStore.set.cursors({});
    },
    onDrop: () => () => {
      cursorStore.set.cursors({});
    },
  },
});
