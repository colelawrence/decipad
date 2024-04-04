import type { MyPlatePlugin } from '@decipad/editor-types';
import { cursorStore } from '@decipad/react-contexts';
import { componentCssVars } from '@decipad/ui';
import { findEventRange } from '@udecode/plate-common';

export const createDragOverCursorPlugin = (): MyPlatePlugin => ({
  key: 'drag-over-cursor',
  handlers: {
    onDragOver: (editor) => (event) => {
      if (editor.isDragging) return;

      const range = findEventRange(editor, event);
      if (!range) return;

      cursorStore.set.dragCursor({
        key: 'drag',
        data: {
          style: {
            backgroundColor: componentCssVars('DroplineColor'),
            width: 2,
          },
        },
        selection: range,
      });
    },
    onDragExit: () => () => {
      cursorStore.set.resetDragCursor();
    },
    onDragLeave: () => () => {
      cursorStore.set.resetDragCursor();
    },
    onDragEnd: () => () => {
      cursorStore.set.resetDragCursor();
    },
    onDrop: () => () => {
      cursorStore.set.resetDragCursor();
    },
  },
});
