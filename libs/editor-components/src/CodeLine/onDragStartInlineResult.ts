import type {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
} from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { Result } from '@decipad/language-interfaces';
import type React from 'react';

export const DRAG_INLINE_RESULT = 'inline-result';

export const onDragStartInlineResult =
  (
    editor: MyEditor,
    {
      element,
      variableName,
      asText = '',
      result,
    }: {
      element: CodeLineElement | CodeLineV2Element;
      variableName?: string;
      asText?: string;
      result: Result.Result;
    }
  ) =>
  (e: React.DragEvent) => {
    onDragStartSmartRef(editor)({
      element,
      variableName,
      asText,
      result,
    })(e);
  };
