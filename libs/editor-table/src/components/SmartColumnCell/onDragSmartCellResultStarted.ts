import { MyEditor } from '@decipad/editor-types';
import { setSlateFragment } from '@decipad/editor-utils';
import { DragEvent } from 'react';

export const DRAG_SMART_CELL_RESULT = 'smart-cell-result';

export const onDragSmartCellResultStarted =
  (editor: MyEditor) =>
  ({ expression }: { expression: string }) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [expression]);

    if (editor.previewRef?.current) {
      const el = editor.previewRef.current.firstChild as HTMLElement;
      el.innerHTML = `${expression}`;

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    editor.setFragmentData(e.dataTransfer, 'drag');
  };
