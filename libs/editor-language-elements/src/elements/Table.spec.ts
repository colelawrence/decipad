import { Computer } from '@decipad/computer';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
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
            cellType: { kind: 'number', unit: null },
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
            children: [{ text: '2.1' }],
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
            children: [{ text: '2.2' }],
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
            children: [{ text: '2.3' }],
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
      await getParsedBlockFromElement(
        editor as MyEditor,
        computer,
        editor.children[0] as MyElement
      )
    ).toMatchObject([
      {
        type: 'identified-block',
        block: {
          type: 'block',
          id: 'root',
          args: [
            {
              type: 'assign',
              args: [
                {
                  type: 'def',
                  args: ['varname'],
                },
                {
                  type: 'table',
                  args: [],
                },
              ],
            },
          ],
        },
      },
      {
        type: 'identified-block',
        id: 'th1',
        block: {
          type: 'block',
          args: [
            {
              type: 'table-column-assign',
              args: [
                {
                  type: 'tablepartialdef',
                  args: ['varname'],
                },
                {
                  args: ['Col1'],
                  type: 'coldef',
                },
                {
                  type: 'column',
                  args: [
                    {
                      type: 'column-items',
                      args: [
                        {
                          type: 'literal',
                          args: ['string', '1.1'],
                        },
                        {
                          type: 'literal',
                          args: ['string', '1.2'],
                        },
                        {
                          type: 'literal',
                          args: ['string', '1.3'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        type: 'identified-block',
        id: 'th2',
        block: {
          type: 'block',
          args: [
            {
              type: 'table-column-assign',
              args: [
                {
                  type: 'tablepartialdef',
                  args: ['varname'],
                },
                {
                  args: ['Col2'],
                  type: 'coldef',
                },
                {
                  type: 'column',
                  args: [
                    {
                      type: 'column-items',
                      args: [
                        {
                          type: 'literal',
                          args: [
                            'number',
                            {
                              d: 10n,
                              n: 21n,
                              s: 1n,
                            },
                          ],
                        },
                        {
                          args: [
                            'number',
                            {
                              d: 5n,
                              n: 11n,
                              s: 1n,
                            },
                          ],
                          type: 'literal',
                        },
                        {
                          args: [
                            'number',
                            {
                              d: 10n,
                              n: 23n,
                              s: 1n,
                            },
                          ],
                          type: 'literal',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        type: 'identified-block',
        id: 'th3',
        block: {
          args: [
            {
              args: [
                {
                  type: 'tablepartialdef',
                  args: ['varname'],
                },
                {
                  args: ['Col3'],
                  type: 'coldef',
                },
                {
                  args: [
                    {
                      args: [
                        {
                          args: [
                            'number',
                            {
                              d: 10n,
                              n: 31n,
                              s: 1n,
                            },
                          ],
                          type: 'literal',
                        },
                        {
                          args: [
                            'number',
                            {
                              d: 5n,
                              n: 16n,
                              s: 1n,
                            },
                          ],
                          type: 'literal',
                        },
                        {
                          args: [
                            'number',
                            {
                              d: 10n,
                              n: 33n,
                              s: 1n,
                            },
                          ],
                          type: 'literal',
                        },
                      ],
                      type: 'column-items',
                    },
                  ],
                  type: 'column',
                },
              ],
              type: 'table-column-assign',
            },
          ],
          type: 'block',
        },
      },
    ]);
  });
});
