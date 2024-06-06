import type { MyEditor } from '@decipad/editor-types';
import type { DragEvent } from 'react';
import type { Result } from '@decipad/remote-computer';
import { dndPreviewActions } from '@decipad/react-contexts';
import { formatResult } from '@decipad/format';

export const DRAG_SMART_CELL_RESULT = 'smart-cell-result';
export const DRAG_SMART_CELL_RESULT_CONTENT_TYPE = 'text/x-smart-cell-result';

export const onDragSmartCellResultStarted =
  (editor: MyEditor) =>
  ({ expression, result }: { expression: string; result: Result.Result }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_CELL_RESULT;
    // This is needed to make it draggable.
    e.dataTransfer.setData('text', '');
    e.dataTransfer.setData(DRAG_SMART_CELL_RESULT_CONTENT_TYPE, expression);

    if (editor.previewRef?.current) {
      dndPreviewActions.previewText(
        formatResult('en-US', result.value, result.type)
      );

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }
  };
