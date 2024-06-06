import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  MARK_MAGICNUMBER,
  type MyGenericEditor,
} from '@decipad/editor-types';
import { RICH_TEXT_BLOCK_TYPES, selectEventRange } from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import {
  DRAG_SMART_CELL_RESULT,
  DRAG_SMART_CELL_RESULT_CONTENT_TYPE,
} from '../components/SmartColumnCell/onDragSmartCellResultStarted';
import type { Value } from '@udecode/plate-common';
import { getBlockAbove } from '@udecode/plate-common';
import { dndStore } from '@udecode/plate-dnd';
import type { DragEvent } from 'react';

export const onDropSmartCellResult =
  <TV extends Value, TE extends MyGenericEditor<TV>>() =>
  (editor: TE) =>
  (event: DragEvent) => {
    if (editor.dragging === DRAG_SMART_CELL_RESULT) {
      // eslint-disable-next-line no-param-reassign
      editor.isDragging = undefined;

      cursorStore.set.resetDragCursor();
      dndStore.set.isDragging(false);
      event.preventDefault();
      event.stopPropagation();

      selectEventRange<TV>(editor)(event);

      const expression = event.dataTransfer.getData(
        DRAG_SMART_CELL_RESULT_CONTENT_TYPE
      );
      if (!expression) return;

      const blockAbove = getBlockAbove(editor) ?? [];
      const [block] = blockAbove;
      if (!block) return;

      if (
        block.type === ELEMENT_CODE_LINE ||
        block.type === ELEMENT_CODE_LINE_V2_CODE
      ) {
        editor.insertFragment([{ text: expression }]);
      } else if (RICH_TEXT_BLOCK_TYPES.includes(block.type as any)) {
        editor.insertFragment([
          {
            text: expression,
            [MARK_MAGICNUMBER]: true,
          },
        ]);
      }
    }
  };
