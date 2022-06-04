import { MyEditor } from '@decipad/editor-types';
import { DragEvent } from 'react';
import { setSlateFragment } from '@decipad/editor-utils';
import { CodeResultProps, DragCellData } from '../../../ui/src/types/index';

export const DRAG_TABLE_CELL_RESULT = 'table-cell-result';

export const onDragStartTableCellResult =
  (
    editor: MyEditor
  ): NonNullable<CodeResultProps<'table'>['onDragStartCell']> =>
  (data: DragCellData) =>
  (e: DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_TABLE_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [data]);

    editor.setFragmentData(e.dataTransfer, 'drag');
  };
