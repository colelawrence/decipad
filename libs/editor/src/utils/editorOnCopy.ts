import {
  blockSelectionSelectors,
  copySelectedBlocks,
} from '@udecode/plate-selection';
import type { ClipboardEvent } from 'react';
import type { MyEditor } from '@decipad/editor-types';

/**
 * Override default onCopy behaviour for editor, use copy blocks when blocks are selected.
 */
export const editorOnCopy = (
  e: ClipboardEvent<HTMLDivElement>,
  editor: MyEditor
) => {
  const blocksSelected = blockSelectionSelectors.selectedIds().size > 0;
  if (blocksSelected) {
    e.preventDefault();
    e.stopPropagation();
    copySelectedBlocks(editor);
  }
};
