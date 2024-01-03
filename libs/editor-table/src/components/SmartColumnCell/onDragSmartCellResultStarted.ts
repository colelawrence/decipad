import type { MyEditor } from '@decipad/editor-types';
import { setSlateFragment } from '@decipad/editor-utils';
import type { DragEvent } from 'react';
import type { Result } from '@decipad/remote-computer';
import { dndPreviewActions } from '@decipad/react-contexts';
import { formatResult } from '@decipad/format';

export const DRAG_SMART_CELL_RESULT = 'smart-cell-result';

export const onDragSmartCellResultStarted =
  (editor: MyEditor) =>
  ({ expression, result }: { expression: string; result: Result.Result }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [expression]);

    if (editor.previewRef?.current) {
      dndPreviewActions.previewText(
        formatResult('en-US', result.value, result.type)
      );

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    editor.setFragmentData(e.dataTransfer, 'drag');
  };
