import {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
} from '@decipad/editor-types';
import { onDragStartSmartRef, setSlateFragment } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import React from 'react';
import { Computer, Result } from '@decipad/computer';

export const DRAG_INLINE_RESULT = 'inline-result';

export const onDragStartInlineResult =
  (
    editor: MyEditor,
    {
      element,
      asText = '',
      computer,
      result,
    }: {
      element: CodeLineElement | CodeLineV2Element;
      asText?: string;
      computer: Computer;
      result: Result.Result;
    }
  ) =>
  (e: React.DragEvent) => {
    if (isFlagEnabled('EXPR_REFS')) {
      onDragStartSmartRef(editor)({
        element,
        asText,
        result,
        computer,
      })(e);
    } else {
      // eslint-disable-next-line no-param-reassign
      editor.dragging = DRAG_INLINE_RESULT;

      setSlateFragment(e.dataTransfer, [element]);

      editor.setFragmentData(e.dataTransfer, 'drag');
    }
  };
