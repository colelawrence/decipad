import { CodeLineElement, MyEditor } from '@decipad/editor-types';
import { onDragStartSmartRef, setSlateFragment } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import React from 'react';

export const DRAG_INLINE_RESULT = 'inline-result';

export const onDragStartInlineResult =
  (
    editor: MyEditor,
    { element, asText = '' }: { element: CodeLineElement; asText?: string }
  ) =>
  (e: React.DragEvent) => {
    if (isFlagEnabled('EXPR_REFS')) {
      onDragStartSmartRef(editor)({
        blockId: element.id,
        asText,
      })(e);
    } else {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = DRAG_INLINE_RESULT;

      setSlateFragment(e.dataTransfer, [element]);

      editor.setFragmentData(e.dataTransfer, 'drag');
    }
  };
