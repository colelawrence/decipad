import type { Computer } from '@decipad/computer-interfaces';
import type { Result } from '@decipad/language-interfaces';
import { setSlateFragment } from '@decipad/editor-utils';
import {
  type MyEditor,
  DEPRECATED_DRAG_EXPRESSION_IN_FRAGMENT,
} from '@decipad/editor-types';
import type { DragEvent } from 'react';
import { dndPreviewActions } from '@decipad/react-contexts';
import { formatResult } from '@decipad/format';

export const onDragStartSmartCell =
  (editor: MyEditor) =>
  ({
    expression,
    result,
  }: {
    expression: string;
    computer: Computer;
    result: Result.Result;
  }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DEPRECATED_DRAG_EXPRESSION_IN_FRAGMENT;

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
