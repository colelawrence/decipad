import { Value, getPointAfter, select } from '@udecode/plate-common';
import { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { Path } from 'slate';

export const selectNextCell = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE,
  path: Path
) => {
  const after = getPointAfter(editor, path);
  if (after) {
    select(editor, after);
  }
};
