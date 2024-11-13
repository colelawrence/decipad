import type { MyEditor, MyText } from '@decipad/editor-types';
import {
  DRAG_SMART_CELL,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import { getSlateFragment, selectEventRange } from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import { getBlockAbove, isElement } from '@udecode/plate-common';
import { dndStore } from '@udecode/plate-dnd';
import type React from 'react';

export const onDropSmartCell =
  (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_SMART_CELL) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

      cursorStore.set.resetDragCursor();
      dndStore.set.isDragging(false);
      event.preventDefault();
      event.stopPropagation();

      selectEventRange(editor)(event);

      const fragment = getSlateFragment(event.dataTransfer) as
        | string
        | undefined;
      if (!fragment) return;

      const [text] = fragment;

      const blockAbove = getBlockAbove(editor) ?? [];
      const [block] = blockAbove;
      if (!block) return;

      const filteredFragment: MyText[] = [];
      if (isElement(block)) {
        if (
          block.type === ELEMENT_CODE_LINE ||
          block.type === ELEMENT_CODE_LINE_V2_CODE
        ) {
          filteredFragment.push({
            text,
          });
        } else if (
          block.type === ELEMENT_PARAGRAPH ||
          block.type === ELEMENT_LIC
        ) {
          filteredFragment.push({
            text,
            [MARK_MAGICNUMBER]: true,
          });
        }
      }

      if (filteredFragment.length) {
        editor.insertFragment(filteredFragment);
      }
    }
  };
