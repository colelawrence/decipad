import { MyEditor } from '@decipad/editor-types';
import { setSlateFragment } from '@decipad/editor-utils';
import { DragEvent } from 'react';
import { DRAG_SMART_CELL } from '@decipad/editor-plugins';

export const onDragStartSmartCell =
  (editor: MyEditor) => (expression: string) => (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_CELL;

    setSlateFragment(e.dataTransfer, [expression]);

    editor.setFragmentData(e.dataTransfer, 'drag');

    // This is needed to make it draggable.
    e.dataTransfer.setData('text', '');
    e.dataTransfer.dropEffect = 'copy';
  };
