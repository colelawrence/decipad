import { MyPlatePlugin } from '@decipad/editor-types';
import { cursorStore } from '@decipad/react-contexts';
import { componentCssVars } from '@decipad/ui';
import { findEventRange } from '@udecode/plate';

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
              backgroundColor: componentCssVars('DroplineColor'),
              width: 2,
            },
          },
          selection: range,
        },
      });
    },
    onDragExit: () => () => {
      cursorStore.set.reset();
    },
    onDragLeave: () => () => {
      cursorStore.set.reset();
    },
    onDragEnd: () => () => {
      cursorStore.set.reset();
    },
    onDrop: () => () => {
      cursorStore.set.reset();
    },
  },
});
