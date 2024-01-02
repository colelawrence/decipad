import { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { Value } from '@udecode/plate-common';
import { getTableGridAbove } from '@udecode/plate-table';

export const getSelectedCells = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE
) => getTableGridAbove(editor, { format: 'cell' });
