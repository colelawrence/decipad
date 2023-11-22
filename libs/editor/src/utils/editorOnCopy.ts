import {
  blockSelectionSelectors,
  copySelectedBlocks,
} from '@udecode/plate-selection';
import { ClipboardEvent } from 'react';
import { MyEditor } from '@decipad/editor-types';

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
