import {
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  MyEditor,
  MyText,
} from '@decipad/editor-types';
import React from 'react';
import {
  findEventRange,
  findNode,
  focusEditor,
  getBlockAbove,
  getEditorString,
  getNodeString,
  getPointAfter,
  getPointBefore,
  isDefined,
  isEditorFocused,
  select,
  TDescendant,
  TElement,
} from '@udecode/plate';
import { getVariableRanges } from '@decipad/editor-utils';

export const onDropCodeLine =
  (editor: MyEditor) => (event: React.DragEvent) => {
    if (editor.dragging) {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = false;

      event.preventDefault();
      event.stopPropagation();

      // Find the range where the drop happened
      const range = findEventRange(editor, event);
      if (!range) return;

      const { dataTransfer } = event;

      select(editor, range);

      const data = dataTransfer.getData('application/x-slate-fragment');

      if (data) {
        const decoded = decodeURIComponent(window.atob(data));
        const fragment = JSON.parse(decoded) as TDescendant[];

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

            const variableRanges = getVariableRanges(
              getNodeString(node),
              path,
              node.id as string
            );

            const variable = variableRanges.find((item) => item.isDeclaration);
            if (variable && isDefined(variable.variableName)) {
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

              if (block.type === ELEMENT_PARAGRAPH) {
                filteredFragment.push({
                  text: variable.variableName,
                  [MARK_MAGICNUMBER]: true,
                });
              }
            }
          }
        });

        editor.insertFragment(filteredFragment);
      }

      // When dragging from another source into the editor, it's possible
      // that the current editor does not have focus.
      if (!isEditorFocused(editor)) {
        focusEditor(editor);
      }
    }
  };
