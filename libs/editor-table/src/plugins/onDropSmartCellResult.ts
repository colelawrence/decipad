import { DragEvent } from 'react';
import {
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  MyEditor,
  MyElement,
  MyText,
} from '@decipad/editor-types';
import { getSlateFragment, selectEventRange } from '@decipad/editor-utils';
import {
  dndStore,
  getBlockAbove,
  insertNodes,
  isElementEmpty,
  removeNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { DRAG_SMART_CELL_RESULT } from '../components/SmartColumnCell/onDragSmartCellResultStarted';

type DragCellData = string;

export const onDropSmartCellResult =
  (editor: MyEditor) => (event: DragEvent) => {
    if (editor.dragging === DRAG_SMART_CELL_RESULT) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

      dndStore.set.isDragging(false);
      event.preventDefault();
      event.stopPropagation();

      selectEventRange(editor)(event);

      const fragment = getSlateFragment(
        event.dataTransfer
      ) as unknown as DragCellData[];
      if (!fragment) return;

      const filteredFragment: MyText[] = [];

      fragment.forEach((data) => {
        const blockAbove = getBlockAbove(editor) ?? [];
        const [block, blockPath] = blockAbove;
        if (!block) return;

        const text = data;

        if (block.type === ELEMENT_CODE_LINE) {
          filteredFragment.push({
            text,
          });
        } else if (block.type === ELEMENT_PARAGRAPH) {
          filteredFragment.push({
            text,
            [MARK_MAGICNUMBER]: true,
          });
        } else {
          if (isElementEmpty(editor, block as MyElement)) {
            removeNodes(editor, { at: blockPath });
          }
          insertNodes(editor, {
            id: nanoid(),
            type: ELEMENT_CODE_LINE,
            children: [
              {
                text,
              },
            ],
          } as CodeLineElement);
        }
      });

      editor.insertFragment(filteredFragment);
    }
  };
