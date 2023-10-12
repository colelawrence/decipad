import { MyEditor } from '@decipad/editor-types';
import { setSlateFragment } from '@decipad/editor-utils';
import { DragEvent } from 'react';
import { DRAG_SMART_CELL } from '@decipad/editor-plugins';
import { DeciNumber } from '@decipad/number';
import { RemoteComputer, Result } from '@decipad/remote-computer';
import { dndPreviewActions } from '@decipad/react-contexts';

export const onDragStartSmartCell =
  (editor: MyEditor) =>
  ({
    computer,
    expression,
    result,
  }: {
    expression: string;
    computer: RemoteComputer;
    result: Result.Result;
  }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_CELL;

    setSlateFragment(e.dataTransfer, [expression]);

    if (editor.previewRef?.current) {
      const formatted = computer.formatNumber(
        result.type as any,
        result.value as DeciNumber
      );

      dndPreviewActions.previewText(formatted.asString);

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    editor.setFragmentData(e.dataTransfer, 'drag');

    e.dataTransfer.dropEffect = 'copy';
  };
