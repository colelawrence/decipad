import { MyEditor } from '@decipad/editor-types';
import { ComponentProps, RefObject } from 'react';
import { setSlateFragment } from '@decipad/editor-utils';
import { CodeResult } from '@decipad/ui';

export const DRAG_TABLE_CELL_RESULT = 'table-cell-result';

export const onDragStartTableCellResult =
  (
    editor: MyEditor
  ): NonNullable<ComponentProps<typeof CodeResult>['onDragStartCell']> =>
  (data, { previewRef }: { previewRef?: RefObject<Element> } = {}) =>
  (e) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_TABLE_CELL_RESULT;

    setSlateFragment(e.dataTransfer, [data]);
    editor.setFragmentData(e.dataTransfer, 'drag');

    if (editor.previewRef?.current && previewRef?.current) {
      const previewClone = previewRef.current?.cloneNode(true) as HTMLElement;
      // eslint-disable-next-line no-param-reassign
      (editor.previewRef.current.firstChild as HTMLElement).innerHTML =
        previewClone.outerHTML;

      e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
    }

    // This is needed to make it draggable.
    e.dataTransfer.setData('text', '');
    e.dataTransfer.dropEffect = 'copy';
  };
