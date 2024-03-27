import { ClipboardEvent } from 'react';
import {
  MyEditor,
  ELEMENT_CALLOUT,
  TopLevelValue,
  MyNode,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_BLOCKQUOTE,
  ElementKind,
} from '@decipad/editor-types';
import { getNode, insertFragment } from '@udecode/plate-common';
import { RemoteComputer } from '@decipad/remote-computer';
import { clone } from '@decipad/editor-utils';

const PASTE_PLAIN_ELEMENTS = new Set<ElementKind>([
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CALLOUT,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_BLOCKQUOTE,
]);

/**
 * Override default onPaste behaviour for editor, when components require special handling.
 */
export const editorOnPaste = (
  e: ClipboardEvent<HTMLDivElement>,
  editor: MyEditor,
  computer: RemoteComputer
) => {
  if (!editor.selection) return;
  if (editor.selection.focus.path[0] !== editor.selection.anchor.path[0]) {
    return;
  }

  const topLevelNode = getNode<TopLevelValue>(editor, [
    editor.selection.anchor.path[0],
  ]);

  // special handling for pasting into custom components
  if (topLevelNode != null && PASTE_PLAIN_ELEMENTS.has(topLevelNode?.type)) {
    const clipboard = e.clipboardData.getData('text/plain');
    editor.insertText(clipboard, { at: editor.selection.anchor });
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (e.clipboardData.types.includes('application/x-slate-fragment')) {
    const data = e.clipboardData.getData('application/x-slate-fragment');
    let decodedData = JSON.parse(decodeURIComponent(window.atob(data)));

    if (topLevelNode?.type !== ELEMENT_TABLE) {
      decodedData = decodedData.map((node: MyNode) => clone(computer, node));
    }

    e.preventDefault();
    e.stopPropagation();
    insertFragment(editor, decodedData, {
      at: editor.selection.anchor.path,
    });
  }
};
