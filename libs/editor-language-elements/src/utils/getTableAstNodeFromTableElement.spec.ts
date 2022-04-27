import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_TD,
  TableElement,
  ELEMENT_TABLE_CAPTION,
} from '@decipad/editor-types';
import { F } from '@decipad/editor-utils';
import { getTableAstNodeFromTableElement } from './getTableAstNodeFromTableElement';

describe('getTableAstNodeFromTableElement', () => {
  it('converts table element into table AST node', () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: 'tableVariableName' }],
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
                unit: {
                  type: 'units',
                  args: [
                    {
                      unit: 'bananas',
                      exp: F(1),
                      multiplier: F(1),
                      known: false,
                    },
                  ],
                },
              },
              children: [{ text: 'column1' }],
            },
            {
              id: 'th2',
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'column2' }],
            },
            {
              id: 'th3',
              type: ELEMENT_TH,
              cellType: {
                kind: 'date',
                date: 'day',
              },
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
              children: [{ text: 'date(2022-01-01)' }],
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
              children: [{ text: 'date(2022-02-01)' }],
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
              children: [{ text: 'date(2022-03-01)' }],
            },
          ],
        },
      ],
    };
    expect(getTableAstNodeFromTableElement(node)).toMatchObject({
      type: 'table',
      args: [
        {
          type: 'table-column',
          args: [
            {
              type: 'coldef',
              args: ['column1'],
            },
            {
              type: 'column',
              args: [
                {
                  type: 'column-items',
                  args: [
                    {
                      type: 'function-call',
                      args: [
                        {
                          args: ['*'],
                          type: 'funcref',
                        },

                        {
                          type: 'argument-list',
                          args: [
                            {
                              type: 'literal',
                              args: ['number', F(1)],
                            },

                            {
                              type: 'ref',
                              args: ['banana'],
                            },
                          ],
                        },
                      ],
                    },

                    {
                      type: 'function-call',
                      args: [
                        {
                          type: 'funcref',
                          args: ['*'],
                        },

                        {
                          type: 'argument-list',
                          args: [
                            {
                              type: 'literal',
                              args: ['number', F(2)],
                            },

                            {
                              type: 'ref',
                              args: ['banana'],
                            },
                          ],
                        },
                      ],
                    },

                    {
                      type: 'function-call',
                      args: [
                        {
                          type: 'funcref',
                          args: ['*'],
                        },

                        {
                          type: 'argument-list',
                          args: [
                            {
                              type: 'literal',
                              args: ['number', F(3)],
                            },

                            {
                              type: 'ref',
                              args: ['banana'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'table-column',
          args: [
            {
              type: 'coldef',
              args: ['column2'],
            },

            {
              type: 'column',
              args: [
                {
                  type: 'column-items',
                  args: [
                    {
                      type: 'literal',
                      args: ['string', 'string 1'],
                    },

                    {
                      type: 'literal',
                      args: ['string', 'string 2'],
                    },

                    {
                      type: 'literal',
                      args: ['string', 'string 3'],
                    },
                  ],
                },
              ],
            },
          ],
        },

        {
          type: 'table-column',
          args: [
            {
              type: 'coldef',
              args: ['column3'],
            },

            {
              type: 'column',
              args: [
                {
                  type: 'column-items',
                  args: [
                    {
                      type: 'date',
                      args: ['year', 2020n, 'month', 1n, 'day', 1n],
                    },

                    {
                      type: 'date',
                      args: ['year', 2020n, 'month', 1n, 'day', 1n],
                    },

                    {
                      type: 'date',
                      args: ['year', 2020n, 'month', 1n, 'day', 1n],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
