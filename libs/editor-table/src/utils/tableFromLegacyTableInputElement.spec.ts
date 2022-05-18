import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_INPUT,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  TableData,
  TableInputElement,
} from '@decipad/editor-types';
import { F } from '@decipad/editor-utils';
import { tableFromLegacyTableInputElement } from './tableFromLegacyTableInputElement';

describe('tableFromLegacyTableInputElement', () => {
  it('translates table data into a table element', () => {
    const tableData: TableData = {
      variableName: 'tableVarName',
      columns: [
        {
          columnName: 'firstColumn',
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
          cells: ['1', '2', '3'],
        },
        {
          columnName: 'secondColumn',
          cellType: {
            kind: 'string',
          },
          cells: ['str 1', 'str 2', 'str 3'],
        },
        {
          columnName: 'thirdColumn',
          cellType: {
            kind: 'date',
            date: 'day',
          },
          cells: ['date(2020-01-01)', 'date(2020-02-01)', 'date(2020-03-01)'],
        },
      ],
    };
    const tableInput: TableInputElement = {
      id: 'tableid',
      type: ELEMENT_TABLE_INPUT,
      tableData,
      children: [{ text: '' }],
    };
    expect(tableFromLegacyTableInputElement(tableInput)).toMatchObject({
      type: 'table',
      id: 'tableid',
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVarName' }],
            },
          ],
        },
        {
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'number',
                unit: {
                  type: 'units',
                  args: [
                    {
                      exp: {
                        d: 1n,
                        n: 1n,
                        s: 1n,
                      },
                      known: false,
                      multiplier: {
                        d: 1n,
                        n: 1n,
                        s: 1n,
                      },
                      unit: 'bananas',
                    },
                  ],
                },
              },
              children: [
                {
                  text: 'firstColumn',
                },
              ],
            },
            {
              cellType: {
                kind: 'string',
              },
              children: [
                {
                  text: 'secondColumn',
                },
              ],
              type: ELEMENT_TH,
            },
            {
              cellType: {
                date: 'day',
                kind: 'date',
              },
              children: [
                {
                  text: 'thirdColumn',
                },
              ],
              type: ELEMENT_TH,
            },
          ],
          type: ELEMENT_TR,
        },
        {
          children: [
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: '1',
                },
              ],
            },
            {
              type: 'td',
              children: [
                {
                  text: 'str 1',
                },
              ],
            },
            {
              type: 'td',
              children: [
                {
                  text: 'date(2020-01-01)',
                },
              ],
            },
          ],
          type: ELEMENT_TR,
        },
        {
          children: [
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: '2',
                },
              ],
            },
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: 'str 2',
                },
              ],
            },
            {
              type: 'td',
              children: [
                {
                  text: 'date(2020-02-01)',
                },
              ],
            },
          ],
          type: 'tr',
        },
        {
          type: 'tr',
          children: [
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: '3',
                },
              ],
            },
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: 'str 3',
                },
              ],
            },
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: 'date(2020-03-01)',
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
