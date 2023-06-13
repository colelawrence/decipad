import {
  createTPlateEditor,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyValue,
  TableCellType,
  TableColumnFormulaElement,
  TableElement,
} from '@decipad/editor-types';
import { BaseEditor, Editor } from 'slate';
import { findNode } from '@udecode/plate';
import { isElementOfType } from '@decipad/editor-utils';
import { createSmartRefPlugin } from '../createSmartRefPlugin';

jest.mock('nanoid', () => ({
  nanoid: () => 'nanoid()',
}));

it('migrates from the old to the new format and sets the version', () => {
  const editor = createTPlateEditor({
    plugins: [createSmartRefPlugin()],
  });
  editor.children = [mkTable()] as any as MyValue;

  Editor.normalize(editor as BaseEditor, { force: true });

  const found = findNode<TableColumnFormulaElement>(editor, {
    at: [],
    match: (n) => isElementOfType(n, ELEMENT_TABLE_COLUMN_FORMULA),
  });

  expect(found?.[0].children).toMatchObject([
    {
      text: '',
    },
    {
      blockId: 'id_Table_headers_one',
      children: [
        {
          text: '',
        },
      ],
      columnId: null,
      type: 'smart-ref',
    },
    {
      text: ' + ',
    },
    {
      blockId: 'id_Table',
      children: [
        {
          text: '',
        },
      ],
      columnId: null,
      type: 'smart-ref',
    },
    {
      text: ' + ',
    },
    {
      blockId: 'id_Table',
      children: [
        {
          text: '',
        },
      ],
      columnId: 'id_Table_headers_one',
      type: 'smart-ref',
    },
    {
      text: '',
    },
  ]);
});

const mkTable = (): TableElement => ({
  type: ELEMENT_TABLE,
  id: `id_Table`,
  children: [
    {
      type: ELEMENT_TABLE_CAPTION,
      id: `id_Table_caption`,
      children: [
        {
          type: ELEMENT_TABLE_VARIABLE_NAME,
          id: `id_Table_variable_name`,
          children: [{ text: 'Table' }],
        },
        {
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          id: `id_Column2_formula`,
          columnId: `id_Table_headers_Column2`,
          children: [{ text: 'Column1 + Table + Table.Column1' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      id: `id_Table_headers`,
      children: [
        {
          type: ELEMENT_TH,
          id: `id_Table_headers_one`,
          children: [{ text: 'Column1' }],
          cellType: { kind: 'number' } as TableCellType,
        },
        {
          type: ELEMENT_TH,
          id: `id_Table_headers_Column2`,
          children: [{ text: 'Column2' }],
          cellType: { kind: 'table-formula' } as TableCellType,
        },
      ],
    },
    {
      type: ELEMENT_TR,
      id: `id_Table_row_1`,
      children: [
        {
          type: ELEMENT_TD,
          id: `id_Table_row_1_one`,
          children: [{ text: '1' }],
        },
        {
          type: ELEMENT_TD,
          id: `id_Table_row_1_Column2`,
          children: [{ text: '' }],
        },
      ],
    },
  ],
});
