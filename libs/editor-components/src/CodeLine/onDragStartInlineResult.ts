import type {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
} from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import type React from 'react';
import type { Result } from '@decipad/remote-computer';

export const DRAG_INLINE_RESULT = 'inline-result';

export const onDragStartInlineResult =
  (
    editor: MyEditor,
    {
      element,
      asText = '',
      result,
    }: {
      element: CodeLineElement | CodeLineV2Element;
      asText?: string;
      result: Result.Result;
    }
  ) =>
  (e: React.DragEvent) => {
    onDragStartSmartRef(editor)({
      element,
      asText,
      result,
    })(e);
  };
