import type { DragEvent } from 'react';
import type { Result } from '@decipad/language-interfaces';
import { dndPreviewActions } from '@decipad/react-contexts';
import { formatResult } from '@decipad/format';
import {
  type MyEditor,
  DRAG_EXPRESSION,
  DRAG_EXPRESSION_CONTENT_TYPE,
} from '@decipad/editor-types';

export const onDragSmartCellResultStarted =
  (editor: MyEditor) =>
  ({ expression, result }: { expression: string; result: Result.Result }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_EXPRESSION;
    // This is needed to make it draggable.
    e.dataTransfer.setData('text', '');
    e.dataTransfer.setData(DRAG_EXPRESSION_CONTENT_TYPE, expression);

    if (editor.previewRef?.current) {
      dndPreviewActions.previewText(
        formatResult('en-US', result.value, result.type)
      );

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }
  };
