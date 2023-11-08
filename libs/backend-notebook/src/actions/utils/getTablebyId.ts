import { TNodeEntry } from '@udecode/plate';
import { ELEMENT_TABLE, MyEditor, TableElement } from '@decipad/editor-types';
import { getElementById } from './getElementById';

export const getTableById = (
  editor: MyEditor,
  tableId: string
): TNodeEntry<TableElement> => getElementById(editor, tableId, ELEMENT_TABLE);
