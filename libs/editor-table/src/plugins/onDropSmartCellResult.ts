import {
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  MyEditor,
  MyElement,
  MyText,
} from '@decipad/editor-types';
import {
  getSlateFragment,
  insertNodes,
  selectEventRange,
} from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import {
  getBlockAbove,
  isElementEmpty,
  isText,
  removeNodes,
} from '@udecode/plate';
import { dndStore } from '@udecode/plate-dnd';
import { nanoid } from 'nanoid';
import { DragEvent } from 'react';
import { DRAG_SMART_CELL_RESULT } from '../components/SmartColumnCell/onDragSmartCellResultStarted';

type DragCellData = string;

export const onDropSmartCellResult =
  (editor: MyEditor) => (event: DragEvent) => {
    if (editor.dragging === DRAG_SMART_CELL_RESULT) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

      cursorStore.set.reset();
      dndStore.set.isDragging(false);
      event.preventDefault();
      event.stopPropagation();

      selectEventRange(editor)(event);

      const fragment = getSlateFragment(
        event.dataTransfer
      ) as unknown as DragCellData[];
      if (!fragment) return;

      const filteredFragments: MyText[] = [];

      fragment.forEach((data) => {
        const blockAbove = getBlockAbove(editor) ?? [];
        const [block, blockPath] = blockAbove;
        if (!block) return;

        const text = data;

        if (
          block.type === ELEMENT_CODE_LINE ||
          block.type === ELEMENT_CODE_LINE_V2_CODE
        ) {
          filteredFragments.push({
            text,
          });
        } else if (
          block.type === ELEMENT_PARAGRAPH ||
          block.type === ELEMENT_LIC
        ) {
          filteredFragments.push({
            text,
            [MARK_MAGICNUMBER]: true,
          });
        } else {
          if (isElementEmpty(editor, block as MyElement)) {
            removeNodes(editor, { at: blockPath });
          }
          insertNodes(editor, [
            {
              id: nanoid(),
              type: ELEMENT_CODE_LINE,
              children: [
                {
                  text,
                },
              ],
            } as CodeLineElement,
          ]);
        }
      });

      editor.insertFragment(filteredFragments.filter(isText));
    }
  };
