/* istanbul ignore file */
/* tested in apps/client-e2e/src/notebook-calculation-block.ts */
import React from 'react';
import {
  MyEditor,
  ELEMENT_CODE_LINE,
  MyNodeEntry,
} from '@decipad/editor-types';
import { focusEditor, getBlockAbove, getEndPoint } from '@udecode/plate-common';
import { RemoteComputer } from '@decipad/remote-computer';
import {
  focusAndSetSelection,
  insertCodeLineBelow,
} from '@decipad/editor-utils';
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
  const entry = getBlockAbove(editor);
  if (!entry) return;

  const [node] = entry;
  if (node.type !== ELEMENT_CODE_LINE) {
    return;
  }

  return entry;
};

export const onKeyDownCodeLine =
  (computer: RemoteComputer) =>
  (editor: MyEditor) =>
  (event: React.KeyboardEvent<Element>) => {
    if (event.key !== 'Enter') return;

    const codeLine = findCodeLineParentEntry(editor);
    if (!codeLine) return;
    const path = codeLine[1];

    if (event.shiftKey) {
      event.preventDefault();
      insertCodeLineBelow(editor, path, true);
      const nextBlock = [path[0] + 1, 0];
      focusAndSetSelection(editor, nextBlock);
      return;
    }

    const shouldSoftBreak = filterStatementSeparator(editor, computer);

    if (shouldSoftBreak) {
      event.preventDefault();
      editor.insertText('\n');
    } else {
      event.preventDefault();
      jumpToCodeLineEnd(editor, codeLine);
    }
  };
