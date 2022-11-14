import { Computer } from '@decipad/computer';
import {
  ELEMENT_SMART_REF,
  MyEditor,
  MyElement,
  MyNode,
} from '@decipad/editor-types';
import {
  DRAG_BLOCK_ID_CONTENT_TYPE,
  DRAG_SMART_REF,
  getCollapsedSelection,
  selectEventRange,
} from '@decipad/editor-utils';
import {
  focusEditor,
  getBlockAbove,
  getNodeString,
  insertNodes,
  isEditorFocused,
  isElement,
} from '@udecode/plate';
import React from 'react';
import { BasePoint, Path } from 'slate';
import { insertSmartRef } from './insertSmartRef';

export const onDropSmartRef =
  (computer: Computer) => (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_SMART_REF) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

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
      if (!result) {
        return;
      }

      const { textBefore, textAfter } =
        findTextBeforeAndAfterPoint(blockAbove, blockAbovePath, selection) ??
        {};

      if (textBefore == null || textAfter == null) {
        return;
      }

      const nodes = insertSmartRef(
        blockAbove.type,
        blockId,
        textBefore,
        textAfter
      );

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
