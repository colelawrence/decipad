/* istanbul ignore file */
/* tested in apps/client-e2e/src/notebook-calculation-block.ts */
import React from 'react';
import {
  BlockElement,
  MyEditor,
  ELEMENT_CODE_LINE,
  MyNodeEntry,
} from '@decipad/editor-types';
import { focusEditor, getBlockAbove, getEndPoint } from '@udecode/plate';
import { Computer } from '@decipad/computer';
import { filterStatementSeparator } from './filterStatementSeparator';

const jumpToCodeLineEnd = (editor: MyEditor, nodeEntry: MyNodeEntry) => {
  const loc = editor.selection?.focus;
  if (!loc) return;

  const codeLineEnd = getEndPoint(editor, nodeEntry[1]);

  focusEditor(editor, {
    focus: codeLineEnd,
    anchor: codeLineEnd,
  });
};

const findCodeLineParentEntry = (editor: MyEditor) => {
  const entry = getBlockAbove<BlockElement>(editor);
  if (!entry) return;

  const [node] = entry;
  if (node.type !== ELEMENT_CODE_LINE) return null;

  return entry;
};

export const onKeyDownCodeLine =
  (computer: Computer) =>
  (editor: MyEditor) =>
  (event: React.KeyboardEvent<Element>) => {
    if (event.key !== 'Enter') return;

    const codeLine = findCodeLineParentEntry(editor);
    if (!codeLine) return;

    const shouldSoftBreak = filterStatementSeparator(editor)(
      codeLine,
      computer
    );

    if (shouldSoftBreak) {
      event.preventDefault();
      editor.insertText('\n');
    } else {
      event.preventDefault();
      jumpToCodeLineEnd(editor, codeLine);
    }
  };
