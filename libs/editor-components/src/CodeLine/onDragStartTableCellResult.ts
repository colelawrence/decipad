import { MyEditor } from '@decipad/editor-types';
import { ComponentProps } from 'react';
import { setSlateFragment } from '@decipad/editor-utils';
import { CodeResult } from '@decipad/ui';
import { Computer, SerializedTypes } from '@decipad/computer';
import { DeciNumber } from '@decipad/number';
import { dndPreviewActions } from '@decipad/react-contexts';

export const DRAG_TABLE_CELL_RESULT = 'table-cell-result';

export const onDragStartTableCellResult =
  (
    editor: MyEditor,
    {
      computer,
    }: {
      computer: Computer;
    }
  ): NonNullable<ComponentProps<typeof CodeResult>['onDragStartCell']> =>
  (data, { previewRef, result }) =>
  (e) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_TABLE_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [data]);
    editor.setFragmentData(e.dataTransfer, 'drag');

    if (editor.previewRef?.current && previewRef?.current) {
      const formatted = computer.formatNumber(
        result.type as SerializedTypes.Number,
        result.value as DeciNumber
      );

      dndPreviewActions.previewText(formatted.asString);

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    e.dataTransfer.dropEffect = 'copy';
  };
