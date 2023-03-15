import {
  CodeLineElement,
  ELEMENT_CODE_LINE,
  MyEditor,
  MyElement,
  MyText,
} from '@decipad/editor-types';
import React, { ComponentProps } from 'react';
import {
  getSlateFragment,
  insertNodes,
  selectEventRange,
} from '@decipad/editor-utils';
import { DRAG_TABLE_CELL_RESULT } from '@decipad/editor-components';
import { getBlockAbove, isElementEmpty, removeNodes } from '@udecode/plate';
import { CodeResult } from '@decipad/ui';
import { nanoid } from 'nanoid';
import { dndStore } from '@udecode/plate-dnd';

type DragCellData = Parameters<
  NonNullable<ComponentProps<typeof CodeResult>['onDragStartCell']>
>[0];

export const onDropTableCellResult =
  (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_TABLE_CELL_RESULT) {
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

        const text = `lookup(${data.tableName}, "${data.cellValue}").${data.columnName}`;

        if (block.type === ELEMENT_CODE_LINE) {
          filteredFragment.push({
            text,
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
