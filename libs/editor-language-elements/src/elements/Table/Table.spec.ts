import { AST, Computer, prettyPrintAST } from '@decipad/computer';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  TableElement,
} from '@decipad/editor-types';
import { N } from '@decipad/number';
import { createPlateEditor } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { Table } from './Table';

expect.addSnapshotSerializer({
  test: (value) =>
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'args' in value,
  print: (value) => prettyPrintAST(value as AST.Node),
});

const getParsedBlockFromElement = getDefined(Table.getParsedBlockFromElement);

describe('Table', () => {
  const editor = createPlateEditor() as MyEditor;
  it('converts table element into table AST node', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVariableName' }],
            },
          ],
        },
        // header row
        {
          id: 'tr1',
          type: ELEMENT_TR,
          children: [
            {
              id: 'th1',
              type: ELEMENT_TH,
              cellType: {
                kind: 'number',
                unit: [
                  {
                    unit: 'bananas',
                    exp: N(1),
                    multiplier: N(1),
                    known: false,
                  },
                ],
              },
              children: [{ text: 'column1' }],
            },
            {
              id: 'th2',
              type: ELEMENT_TH,
              cellType: { kind: 'string' },
              children: [{ text: 'column2' }],
            },
            {
              id: 'th3',
              type: ELEMENT_TH,
              cellType: { kind: 'date', date: 'day' },
              children: [{ text: 'column3' }],
            },
          ],
        },
        // data rows
        {
          id: 'tr2',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td11',
              children: [{ text: '1' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td12',
              children: [{ text: 'string 1' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td13',
              children: [{ text: '2022-01-01' }],
            },
          ],
        },
        {
          id: 'tr3',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td21',
              children: [{ text: '2' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td22',
              children: [{ text: 'string 2' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td23',
              children: [{ text: '2022-02-01' }],
            },
          ],
        },
        {
          id: 'tr4',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td31',
              children: [{ text: '3' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td32',
              children: [{ text: 'string 3' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td33',
              children: [{ text: '2022-03-01' }],
            },
          ],
        },
      ],
    };

    const result = await getParsedBlockFromElement(
      editor,
      new Computer(),
      node
    );

    expect(
      result.map((ex) => ({
        blockId: ex.id,
        column: ex.block?.args[0],
        errors: ex.type === 'identified-error' && ex.error,
      }))
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "blockId": "table1",
          "column": (table tableVariableName),
          "errors": false,
        },
        Object {
          "blockId": "th1",
          "column": (table-column-assign (tablepartialdef tableVariableName) (coldef column1) (column (implicit* 1 (ref bananas)) (implicit* 2 (ref bananas)) (implicit* 3 (ref bananas))) 0),
          "errors": false,
        },
        Object {
          "blockId": "th2",
          "column": (table-column-assign (tablepartialdef tableVariableName) (coldef column2) (column "string 1" "string 2" "string 3") 1),
          "errors": false,
        },
        Object {
          "blockId": "th3",
          "column": (table-column-assign (tablepartialdef tableVariableName) (coldef column3) (column (date year 2022 month 1 day 1) (date year 2022 month 2 day 1) (date year 2022 month 3 day 1)) 2),
          "errors": false,
        },
      ]
    `);
  });

  it('converts table formulas correctly', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVariableName' }],
            },
            {
              id: 'formula',
              type: ELEMENT_TABLE_COLUMN_FORMULA,
              columnId: 'th2',
              children: [{ text: '1 + 1' }],
            },
          ],
        },
        // header row
        {
          id: 'tr1',
          type: ELEMENT_TR,
          children: [
            {
              id: 'th1',
              type: ELEMENT_TH,
              cellType: { kind: 'string' },
              children: [{ text: 'column1' }],
            },
            {
              id: 'th2',
              type: ELEMENT_TH,
              cellType: { kind: 'table-formula' },
              children: [{ text: 'column2' }],
            },
          ],
        },
        // data row
        {
          id: 'tr2',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td1',
              children: [{ text: 'Hello' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td2',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    };

    expect(
      (await getParsedBlockFromElement(editor, new Computer(), node)).map(
        (ex) => ({
          blockId: ex.id,
          column: ex.block?.args[0],
          errors: ex.type === 'identified-error' && ex.error,
        })
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "blockId": "table1",
          "column": (table tableVariableName),
          "errors": false,
        },
        Object {
          "blockId": "th1",
          "column": (table-column-assign (tablepartialdef tableVariableName) (coldef column1) (column "Hello") 0),
          "errors": false,
        },
        Object {
          "blockId": "th2",
          "column": (table-column-assign (tablepartialdef tableVariableName) (coldef column2) (+ 1 1) 1),
          "errors": false,
        },
      ]
    `);
  });

  it('converts series columns correctly', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVariableName' }],
            },
          ],
        },
        // header row
        {
          id: 'tr1',
          type: ELEMENT_TR,
          children: [
            {
              id: 'th1',
              type: ELEMENT_TH,
              cellType: { kind: 'series', seriesType: 'date' },
              children: [{ text: 'column1' }],
            },
          ],
        },
        // data row
        {
          id: 'tr2',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td1',
              children: [{ text: '2020-01' }],
            },
          ],
        },
        // next month, hopefully
        {
          id: 'tr3',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td2',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    };

    expect(
      (await getParsedBlockFromElement(editor, new Computer(), node)).map(
        (ex) => ({
          blockId: ex.id,
          column: ex.block?.args[0],
          errors: ex.type === 'identified-error' && ex.error,
        })
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "blockId": "table1",
          "column": (table tableVariableName),
          "errors": false,
        },
        Object {
          "blockId": "th1",
          "column": (table-column-assign (tablepartialdef tableVariableName) (coldef column1) (column (date year 2020 month 1) (date year 2020 month 2)) 0),
          "errors": false,
        },
      ]
    `);
  });
});
