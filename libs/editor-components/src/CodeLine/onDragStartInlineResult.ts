import {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
} from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
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
    onDragStartSmartRef(editor)({
      element,
      asText,
      result,
      computer,
    })(e);
  };
