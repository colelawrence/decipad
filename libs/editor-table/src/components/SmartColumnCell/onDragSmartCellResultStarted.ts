import { MyEditor } from '@decipad/editor-types';
import { setSlateFragment } from '@decipad/editor-utils';
import { DragEvent } from 'react';
import { Computer, Result, SerializedTypes } from '@decipad/computer';
import { DeciNumber } from '@decipad/number';
import { dndPreviewActions } from '@decipad/react-contexts';

export const DRAG_SMART_CELL_RESULT = 'smart-cell-result';

export const onDragSmartCellResultStarted =
  (editor: MyEditor) =>
  ({
    expression,
    computer,
    result,
  }: {
    expression: string;
    computer: Computer;
    result: Result.Result;
  }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [expression]);

    if (editor.previewRef?.current) {
      const formatted = computer.formatNumber(
        result.type as SerializedTypes.Number,
        result.value as DeciNumber
      );

      dndPreviewActions.previewText(formatted.asString);

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    editor.setFragmentData(e.dataTransfer, 'drag');
  };
