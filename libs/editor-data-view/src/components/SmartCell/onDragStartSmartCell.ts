import type { MyEditor } from '@decipad/editor-types';
import { setSlateFragment } from '@decipad/editor-utils';
import type { DragEvent } from 'react';
import { DRAG_SMART_CELL } from '@decipad/editor-plugins';
import type { RemoteComputer, Result } from '@decipad/remote-computer';
import { dndPreviewActions } from '@decipad/react-contexts';
import { formatResult } from '@decipad/format';

export const onDragStartSmartCell =
  (editor: MyEditor) =>
  ({
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
      dndPreviewActions.previewText(
        formatResult('en-US', result.value, result.type)
      );

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    editor.setFragmentData(e.dataTransfer, 'drag');

    e.dataTransfer.dropEffect = 'copy';
  };
