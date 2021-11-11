import { Editor, Transforms } from 'slate';
import { insertNodes, SPEditor, TDescendant } from '@udecode/plate';
import { TABLE_INPUT } from '../../../utils/elementTypes';

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

export const insertTable = (editor: SPEditor): void => {
  const rootPath = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  })?.[1];

  if (!rootPath) return;

  // Delete the block where we will put the table
  Transforms.delete(editor, { at: rootPath, unit: 'block' });
  // insert a new table into the document
  insertNodes<TDescendant>(editor, tableElement, { at: rootPath });
};
