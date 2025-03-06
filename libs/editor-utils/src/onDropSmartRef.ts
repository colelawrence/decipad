import type { Computer } from '@decipad/computer-interfaces';
import {
  MyEditor,
  DRAG_BLOCK_ID,
  DRAG_BLOCK_ID_CONTENT_TYPE,
  DRAG_EXPRESSION,
  DRAG_EXPRESSION_CONTENT_TYPE,
  DRAG_VARIABLE_NAME_CONTENT_TYPE,
} from '@decipad/editor-types';
import { getCollapsedSelection } from './selection';
import { selectEventRange } from './selectEventRange';
import { insertSmartRef } from './insertSmartRef';
import { cursorStore } from '@decipad/react-contexts';
import { focusEditor, isEditorFocused } from '@udecode/plate-common';
import { dndStore } from '@udecode/plate-dnd';
import type React from 'react';

const allowedDragTypes = [DRAG_BLOCK_ID, DRAG_EXPRESSION];

export const onDropSmartRef =
  (computer: Computer) => (editor: MyEditor) => (event: React.DragEvent) => {
    if (!allowedDragTypes.includes(editor.dragging as string)) return;
    const dragType = editor.dragging;

    // eslint-disable-next-line no-param-reassign
    editor.isDragging = undefined;

    // eslint-disable-next-line no-param-reassign
    editor.dragging = null;

    cursorStore.set.resetDragCursor();
    dndStore.set.isDragging(false);
    event.preventDefault();
    event.stopPropagation();

    selectEventRange(editor)(event);

    const at = getCollapsedSelection(editor);
    if (!at) return;

    const variableName =
      event.dataTransfer.getData(DRAG_VARIABLE_NAME_CONTENT_TYPE) || undefined;

    switch (dragType) {
      case DRAG_BLOCK_ID:
        const blockId = event.dataTransfer.getData(DRAG_BLOCK_ID_CONTENT_TYPE);
        if (!blockId) return;

        insertSmartRef(editor, {
          computer,
          at,
          blockId,
          variableName,
        });

        break;

      case DRAG_EXPRESSION:
        const expression = event.dataTransfer.getData(
          DRAG_EXPRESSION_CONTENT_TYPE
        );
        if (!expression) return;

        insertSmartRef(editor, {
          computer,
          at,
          expression,
          variableName,
        });

        break;
    }

    // When dragging from another source into the editor, it's possible
    // that the current editor does not have focus.
    if (!isEditorFocused(editor)) {
      focusEditor(editor);
    }
  };
