import { Computer, prettyPrintAST } from '@decipad/computer';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyElement,
  TableElement,
} from '@decipad/editor-types';
import { createEditor } from 'slate';
import { Table } from '.';

const table = () => {
  return {
    id: 'root',
    type: ELEMENT_TABLE,
    children: [
      {
        id: 'caption',
        type: ELEMENT_TABLE_CAPTION,
        children: [
          {
            id: 'varname',
            type: ELEMENT_TABLE_VARIABLE_NAME,
            children: [{ text: 'varname' }],
          },
          {
            id: 'formula-id',
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            children: [{ text: 'Col1 + 1' }],
            columnId: 'th2',
          },
        ],
      },
      {
        id: 'row1',
        type: ELEMENT_TR,
        children: [
          {
            id: 'th1',
            type: ELEMENT_TH,
            cellType: { kind: 'string' },
            children: [{ text: 'Col1' }],
          },
          {
            id: 'th2',
            type: ELEMENT_TH,
            cellType: { kind: 'table-formula' },
            children: [{ text: 'Col2' }],
          },
          {
            id: 'th3',
            type: ELEMENT_TH,
            cellType: { kind: 'number', unit: null },
            children: [{ text: 'Col3' }],
          },
        ],
      },
      {
        id: 'row2',
        type: ELEMENT_TR,
        children: [
          {
            id: 'td1.1',
            type: ELEMENT_TD,
            children: [{ text: '1.1' }],
          },
          {
            id: 'td2.1',
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
          {
            id: 'td3.1',
            type: ELEMENT_TD,
            children: [{ text: '3.1' }],
          },
        ],
      },
      {
        id: 'row3',
        type: ELEMENT_TR,
        children: [
          {
            id: 'td1.2',
            type: ELEMENT_TD,
            children: [{ text: '1.2' }],
          },
          {
            id: 'td2.2',
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
          {
            id: 'td3.2',
            type: ELEMENT_TD,
            children: [{ text: '3.2' }],
          },
        ],
      },
      {
        id: 'row4',
        type: ELEMENT_TR,
        children: [
          {
            id: 'td1.3',
            type: ELEMENT_TD,
            children: [{ text: '1.3' }],
          },
          {
            id: 'td2.3',
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
          {
            id: 'td3.3',
            type: ELEMENT_TD,
            children: [{ text: '3.3' }],
          },
        ],
      },
    ],
  } as TableElement;
};

describe('Table', () => {
  it('spits out the correct AST', async () => {
    const editor = createEditor();
    editor.children = [table()];
    const computer = new Computer();
    expect(Table.type).toBe(ELEMENT_TABLE);
    if (!Table.getParsedBlockFromElement) {
      throw new Error('getParsedBlockFromElement should be defined');
    }
    const { getParsedBlockFromElement } = Table;

    expect(
      (
        await getParsedBlockFromElement(
          editor as MyEditor,
          computer,
          editor.children[0] as MyElement
        )
      ).map((elements) => {
        return [elements.id, elements.block && prettyPrintAST(elements.block)];
      })
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          "root",
          "(block
        (table varname))",
        ],
        Array [
          "th1",
          "(block
        (table-column-assign (tablepartialdef varname) (coldef Col1) (column \\"1.1\\" \\"1.2\\" \\"1.3\\")))",
        ],
        Array [
          "th2",
          "(block
        (table-column-assign (tablepartialdef varname) (coldef Col2) (+ (ref Col1) 1)))",
        ],
        Array [
          "th3",
          "(block
        (table-column-assign (tablepartialdef varname) (coldef Col3) (column 3.1 3.2 3.3)))",
        ],
      ]
    `);
  });
});
