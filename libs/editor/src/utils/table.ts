import { ELEMENT_TABLE_INPUT } from '@decipad/editor-types';
import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from './path';

const tableElement = {
  type: ELEMENT_TABLE_INPUT,
  tableData: {
    variableName: '',
    columns: [
      {
        columnName: '',
        cells: ['', '', ''],
        cellType: { kind: 'string' },
      },
    ],
  },
  children: [],
} as const;

export const insertTableBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, tableElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
