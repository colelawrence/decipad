import type { Value } from '@udecode/plate-common';
import { getPointAfter, select, getPointBefore } from '@udecode/plate-common';
import type { MyGenericEditor, MyValue } from '@decipad/editor-types';
import type { Location, Path } from 'slate';
import { nextCellPath } from './nextCellPath';

export const selectNextCell = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE,
  path: Path,
  edge: 'before' | 'after' | 'top' | 'left' | 'bottom' | 'right' = 'after'
) => {
  const at: Location | undefined = (() => {
    if (edge === 'before') {
      return getPointBefore(editor, path);
    }
    if (edge === 'after') {
      return getPointAfter(editor, path);
    }
    return nextCellPath(path, edge);
  })();

  if (at) {
    try {
      select(editor, at);
    } catch (e) {
      // The destination cell does not exist
    }
  }
};
