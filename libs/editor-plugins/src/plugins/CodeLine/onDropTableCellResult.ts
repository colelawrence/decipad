import { DRAG_TABLE_CELL_RESULT } from '@decipad/editor-components';
import type { MyEditor, MyElement, MyText } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import {
  getSlateFragment,
  insertNodes,
  selectEventRange,
} from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import type { CodeResult } from '@decipad/ui';
import {
  getBlockAbove,
  isElement,
  isElementEmpty,
  removeNodes,
} from '@udecode/plate-common';
import { dndStore } from '@udecode/plate-dnd';
import { nanoid } from 'nanoid';
import type { ComponentProps } from 'react';
import type React from 'react';

type DragCellData = Parameters<
  NonNullable<ComponentProps<typeof CodeResult>['onDragStartCell']>
>[0];

export const onDropTableCellResult =
  (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_TABLE_CELL_RESULT) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

      cursorStore.set.resetDragCursor();
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

        const text = `lookup(${data.tableName}, "${data.cellValue}").${data.columnName}`;

        if (isElement(block) && block.type === ELEMENT_CODE_LINE) {
          filteredFragment.push({
            text,
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
            },
          ]);
        }
      });

      editor.insertFragment(filteredFragment);
    }
  };
