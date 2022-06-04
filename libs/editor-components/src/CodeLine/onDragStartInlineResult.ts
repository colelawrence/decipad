import { CodeLineElement, MyEditor } from '@decipad/editor-types';
import React from 'react';
import { setSlateFragment } from '@decipad/editor-utils';

export const DRAG_INLINE_RESULT = 'inline-result';

export const onDragStartInlineResult =
  (editor: MyEditor, { element }: { element: CodeLineElement }) =>
  (e: React.DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_INLINE_RESULT;

    setSlateFragment(e.dataTransfer, [element]);

    editor.setFragmentData(e.dataTransfer, 'drag');
  };
