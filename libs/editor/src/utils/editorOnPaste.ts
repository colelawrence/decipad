import { ClipboardEvent } from 'react';
import {
  MyEditor,
  ELEMENT_CALLOUT,
  TopLevelValue,
  MyNode,
} from '@decipad/editor-types';
import { getNode, insertFragment } from '@udecode/plate-common';
import { RemoteComputer } from '@decipad/remote-computer';
import { clone } from '@decipad/editor-utils';

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

  const selectedNode = getNode<TopLevelValue>(editor, [
    editor.selection.anchor.path[0],
  ]);

  if (selectedNode && selectedNode.type === ELEMENT_CALLOUT) {
    const clipboard = e.clipboardData.getData('text/plain');
    editor.insertText(clipboard, { at: editor.selection.anchor });
    e.preventDefault();
    return;
  }

  // deduplicate ids when pasting slate components
  if (e.clipboardData.types.includes('application/x-slate-fragment')) {
    const data = e.clipboardData.getData('application/x-slate-fragment');
    const decodedData = JSON.parse(decodeURIComponent(window.atob(data)));

    e.preventDefault();
    e.stopPropagation();
    insertFragment(
      editor,
      decodedData.map((node: MyNode) => clone(computer, node)),
      {
        at: editor.selection.anchor.path,
      }
    );
  }
};
