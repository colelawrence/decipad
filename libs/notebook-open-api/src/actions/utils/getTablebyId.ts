import type { TNodeEntry } from '@udecode/plate-common';
import type { MyEditor, TableElement } from '@decipad/editor-types';
import { ELEMENT_TABLE } from '@decipad/editor-types';
import { getElementById } from './getElementById';

export const getTableById = (
  editor: MyEditor,
  tableId: string
): TNodeEntry<TableElement> => getElementById(editor, tableId, ELEMENT_TABLE);
