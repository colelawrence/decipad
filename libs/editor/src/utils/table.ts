import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { TABLE_INPUT } from './elementTypes';
import { getPathBelowBlock } from './path';

const tableElement = {
  type: TABLE_INPUT,
  tableData: {
    variableName: '',
    columns: [
      {
        columnName: '',
        cells: ['', '', ''],
        cellType: 'string',
      },
    ],
  },
  children: [],
} as const;

export const insertTableBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, tableElement, {
    at: getPathBelowBlock(editor, path),
  });
};
