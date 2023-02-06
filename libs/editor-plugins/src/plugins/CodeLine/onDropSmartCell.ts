import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  MyEditor,
  MyText,
} from '@decipad/editor-types';
import React from 'react';
import { getBlockAbove } from '@udecode/plate';
import { getSlateFragment, selectEventRange } from '@decipad/editor-utils';
import { dndStore } from '@udecode/plate-ui-dnd';

export const DRAG_SMART_CELL = 'smart-cell';

export const onDropSmartCell =
  (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_SMART_CELL) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

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

      if (
        block.type === ELEMENT_CODE_LINE ||
        block.type === ELEMENT_CODE_LINE_V2_CODE
      ) {
        filteredFragment.push({
          text,
        });
      } else if (block.type === ELEMENT_PARAGRAPH) {
        filteredFragment.push({
          text,
          [MARK_MAGICNUMBER]: true,
        });
      }

      if (filteredFragment.length) {
        editor.insertFragment(filteredFragment);
      }
    }
  };
