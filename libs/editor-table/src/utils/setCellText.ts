import type { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import type { Value } from '@udecode/plate-common';
import { replaceNodeChildren, withoutNormalizing } from '@udecode/plate-common';
import type { Path } from 'slate';
import { coerceInputToNumber } from './coerceInputToNumber';

export const setCellText = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE,
  path: Path,
  text: string
) => {
  withoutNormalizing(editor, () => {
    const { selection } = editor;
    const newCellValue = coerceInputToNumber(text);

    replaceNodeChildren(editor, {
      at: path,
      nodes: { text: newCellValue } as any,
      removeOptions: {
        voids: true,
      },
    });

    /**
     * Performing replaceNodeChildren on the selected node causes the
     * selection to move to the previous node. Manually restore the selection
     * to mitigate this.
     */
    if (selection) {
      setSelection(editor, selection);
    }
  });
};
