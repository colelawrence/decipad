import type { MyEditor } from '@decipad/editor-types';
import type { ComponentProps } from 'react';
import { setSlateFragment } from '@decipad/editor-utils';
import type { CodeResult } from '@decipad/ui';
import type { SerializedTypes } from '@decipad/remote-computer';
import type { DeciNumber } from '@decipad/number';
import { dndPreviewActions } from '@decipad/react-contexts';
import { formatResult } from '@decipad/format';

export const DRAG_TABLE_CELL_RESULT = 'table-cell-result';

export const onDragStartTableCellResult =
  (
    editor: MyEditor
  ): NonNullable<ComponentProps<typeof CodeResult>['onDragStartCell']> =>
  (data, { previewRef, result }) =>
  (e) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_TABLE_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [data]);
    editor.setFragmentData(e.dataTransfer, 'drag');

    if (editor.previewRef?.current && previewRef?.current) {
      dndPreviewActions.previewText(
        formatResult(
          'en-US',
          result.value as DeciNumber,
          result.type as SerializedTypes.Number
        )
      );

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    e.dataTransfer.dropEffect = 'copy';
  };
