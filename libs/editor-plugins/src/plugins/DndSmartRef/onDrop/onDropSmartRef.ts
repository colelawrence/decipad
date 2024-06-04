import type { Computer } from '@decipad/computer-interfaces';
import type {
  MathElement,
  MyEditor,
  MyElement,
  MyNode,
} from '@decipad/editor-types';
import { ELEMENT_MATH, ELEMENT_SMART_REF } from '@decipad/editor-types';
import {
  DRAG_BLOCK_ID_CONTENT_TYPE,
  DRAG_SMART_REF,
  getCollapsedSelection,
  insertNodes,
  selectEventRange,
} from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import {
  focusEditor,
  getBlockAbove,
  getNodeString,
  isEditorFocused,
  isElement,
} from '@udecode/plate-common';
import { dndStore } from '@udecode/plate-dnd';
import type React from 'react';
import type { BasePoint } from 'slate';
import { Path } from 'slate';
import { insertSmartRef } from './insertSmartRef';
import { nanoid } from 'nanoid';

export const onDropSmartRef =
  (computer: Computer) => (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_SMART_REF) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

      cursorStore.set.resetDragCursor();
      dndStore.set.isDragging(false);
      event.preventDefault();
      event.stopPropagation();

      selectEventRange(editor)(event);

      const blockId = event.dataTransfer.getData(DRAG_BLOCK_ID_CONTENT_TYPE);
      if (!blockId) {
        return;
      }

      const selection = getCollapsedSelection(editor);
      if (!selection) {
        return;
      }

      const [blockAbove, blockAbovePath] =
        getBlockAbove(editor, { at: selection }) ?? [];
      if (!blockAbove || !blockAbovePath || !isElement(blockAbove)) {
        return;
      }

      const result = computer.getBlockIdResult$.get(blockId);
      const smartId = computer.getBlockIdAndColumnId$.get(blockId);
      if (!result || !smartId) {
        return;
      }

      const { textBefore, textAfter } =
        findTextBeforeAndAfterPoint(blockAbove, blockAbovePath, selection) ??
        {};

      if (textBefore == null || textAfter == null) {
        return;
      }

      // Special case for math block, here we want to insert a math block into an empty paragraph
      if (
        textBefore.length === 0 &&
        textAfter.length === 0 &&
        result.result?.type.kind === 'function'
      ) {
        const math: MathElement = {
          id: nanoid(),
          type: ELEMENT_MATH,
          blockId,
          children: [{ text: '' }],
        };

        insertNodes(editor, [math]);
        return;
      }

      const nodes = insertSmartRef(blockAbove.type, ...smartId, textAfter);

      if (nodes != null) {
        insertNodes(editor, nodes);
      }

      // When dragging from another source into the editor, it's possible
      // that the current editor does not have focus.
      if (!isEditorFocused(editor)) {
        focusEditor(editor);
      }
    }
  };

export function findTextBeforeAndAfterPoint(
  blockAbove: MyElement,
  blockAbovePath: Path,
  { path, offset }: BasePoint
) {
  const [myBlockIndex] = Path.relative(path, blockAbovePath);
  if (myBlockIndex == null) {
    return;
  }

  const blocksBefore = blockAbove.children.slice(0, myBlockIndex);
  const blocksAfter = blockAbove.children.slice(myBlockIndex + 1);
  const blockItself = blockAbove.children[myBlockIndex];

  if (blockItself == null) {
    return;
  }

  const getText = (blocks: MyNode[]): string =>
    blocks.reduce(
      (acc, item) =>
        acc +
        (isElement(item) && item.type === ELEMENT_SMART_REF
          ? 'smartrefplaceholder'
          : getNodeString(item)),
      ''
    );

  const textBefore =
    getText(blocksBefore) + getText([blockItself]).slice(0, offset);
  const textAfter = getText([blockItself]).slice(offset) + getText(blocksAfter);

  return { textBefore, textAfter };
}
