import { insertNodes, SPEditor } from '@udecode/plate';
import { Editor, Transforms } from 'slate';
import { TABLE_INPUT } from '../../../utils/elementTypes';

const tableElement = {
  type: TABLE_INPUT,
  tableData: {
    variableName: 'TableName',
    columns: [
      {
        columnName: 'FirstName',
        cells: ['', '', ''],
        cellType: 'string',
      },
      {
        columnName: 'LastName',
        cells: ['', '', ''],
        cellType: 'string',
      },
    ],
  },
  children: [],
};

export const formatTable = (editor: SPEditor): void => {
  const rootPath = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  })?.[1];

  if (!rootPath) return;

  // Delete the empty paragraph element above the table
  Transforms.delete(editor, { at: rootPath, unit: 'block' });
  // insert a new table into the document
  insertNodes(editor, tableElement, {
    at: rootPath,
  });
};
