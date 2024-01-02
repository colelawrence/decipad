import {
  replaceNodeChildren,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { Path } from 'slate';
import { setSelection } from '@decipad/editor-utils';

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

    replaceNodeChildren(editor, {
      at: path,
      nodes: { text } as any,
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
