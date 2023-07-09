import { getExprRef } from '@decipad/computer';
import { DRAG_INLINE_RESULT } from '@decipad/editor-components';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  MyEditor,
  MyText,
} from '@decipad/editor-types';
import {
  getSlateFragment,
  getVariableRanges,
  selectEventRange,
} from '@decipad/editor-utils';
import { cursorStore } from '@decipad/react-contexts';
import {
  TElement,
  findNode,
  focusEditor,
  getBlockAbove,
  getEditorString,
  getNodeString,
  getPointAfter,
  getPointBefore,
  isDefined,
  isEditorFocused,
} from '@udecode/plate';
import { dndStore } from '@udecode/plate-dnd';
import React from 'react';

export const onDropInlineResult =
  (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging === DRAG_INLINE_RESULT) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = null;

      cursorStore.set.reset();
      dndStore.set.isDragging(false);
      event.preventDefault();
      event.stopPropagation();

      selectEventRange(editor)(event);

      const fragment = getSlateFragment(event.dataTransfer);
      if (!fragment) return;

      const filteredFragment: MyText[] = [];

      fragment.forEach((node) => {
        if (node.type === ELEMENT_CODE_LINE) {
          const entry = findNode(editor, {
            at: [],
            match: (n) => (n as TElement).id === node.id,
          });
          if (!entry) return;

          const [, path] = entry;

          const blockAbove = getBlockAbove(editor) ?? [];
          const [block] = blockAbove;
          if (!block) return;

          const blockId = node.id as string;

          const variableRanges = getVariableRanges(
            getNodeString(node),
            path,
            blockId
          );

          const variable = variableRanges.find((item) => item.isDeclaration);

          if (variable && isDefined(variable.variableName)) {
            // Code lines need real varnames
            if (block.type === ELEMENT_CODE_LINE) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const selection = editor.selection!;
              const pointBefore = getPointBefore(editor, selection);

              if (pointBefore) {
                const lastChar = getEditorString(editor, {
                  anchor: pointBefore,
                  focus: selection.focus,
                });
                if (lastChar.trim().length) {
                  filteredFragment.push({ text: ' ' });
                }
              }

              filteredFragment.push({ text: variable.variableName });

              const pointAfter = getPointAfter(editor, selection);

              if (pointAfter) {
                const lastChar = getEditorString(editor, {
                  anchor: selection.focus,
                  focus: pointAfter,
                });
                if (lastChar.trim().length) {
                  filteredFragment.push({ text: ' ' });
                }
              }
            }
          }

          // Paragraphs can have a magic number injected with the pill
          if (block.type === ELEMENT_PARAGRAPH) {
            filteredFragment.push({
              text: getExprRef(blockId), // 🔴
              [MARK_MAGICNUMBER]: true,
            });
          }
        }
      });

      editor.insertFragment(filteredFragment);

      // When dragging from another source into the editor, it's possible
      // that the current editor does not have focus.
      if (!isEditorFocused(editor)) {
        focusEditor(editor);
      }
    }
  };
