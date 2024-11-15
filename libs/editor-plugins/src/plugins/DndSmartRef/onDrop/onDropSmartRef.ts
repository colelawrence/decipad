import type { Computer } from '@decipad/computer-interfaces';
import {
  MyEditor,
  DEPRECATED_DRAG_EXPRESSION_IN_FRAGMENT,
  DRAG_BLOCK_ID,
  DRAG_BLOCK_ID_CONTENT_TYPE,
  DRAG_EXPRESSION,
  DRAG_EXPRESSION_CONTENT_TYPE,
} from '@decipad/editor-types';
import {
  getCollapsedSelection,
  getSlateFragment,
  selectEventRange,
  insertSmartRef,
} from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import { focusEditor, isEditorFocused } from '@udecode/plate-common';
import { dndStore } from '@udecode/plate-dnd';
import type React from 'react';

const allowedDragTypes = [
  DRAG_BLOCK_ID,
  DRAG_EXPRESSION,
  DEPRECATED_DRAG_EXPRESSION_IN_FRAGMENT,
];

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

    switch (dragType) {
      case DRAG_BLOCK_ID:
        const blockId = event.dataTransfer.getData(DRAG_BLOCK_ID_CONTENT_TYPE);
        if (!blockId) return;

        insertSmartRef(editor, {
          computer,
          at,
          blockId,
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
        });

        break;

      /**
       * This is deprecated because storing a string in a Slate fragment is
       * semantically incorrect. Prefer DRAG_EXPRESSION for new code.
       */
      case DEPRECATED_DRAG_EXPRESSION_IN_FRAGMENT:
        const fragment = getSlateFragment(event.dataTransfer) as
          | string
          | undefined;
        if (!fragment) return;

        const [text] = fragment;

        insertSmartRef(editor, {
          computer,
          at,
          expression: text,
        });
        break;
    }

    // When dragging from another source into the editor, it's possible
    // that the current editor does not have focus.
    if (!isEditorFocused(editor)) {
      focusEditor(editor);
    }
  };
