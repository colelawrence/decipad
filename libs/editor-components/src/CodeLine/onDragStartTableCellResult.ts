import { MyEditor } from '@decipad/editor-types';
import { ComponentProps } from 'react';
import { setSlateFragment } from '@decipad/editor-utils';
import { CodeResult } from '@decipad/ui';

export const DRAG_TABLE_CELL_RESULT = 'table-cell-result';

export const onDragStartTableCellResult =
  (
    editor: MyEditor
  ): NonNullable<ComponentProps<typeof CodeResult>['onDragStartCell']> =>
  (data) =>
  (e) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_TABLE_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [data]);
    editor.setFragmentData(e.dataTransfer, 'drag');

    // This is needed to make it draggable.
    e.dataTransfer.setData('text', '');
    e.dataTransfer.dropEffect = 'copy';
  };
