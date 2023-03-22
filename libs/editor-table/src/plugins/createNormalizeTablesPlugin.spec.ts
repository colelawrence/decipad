import { Computer } from '@decipad/computer';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import {
  createPlateEditor,
  normalizeEditor,
  TEditor,
  TElement,
} from '@udecode/plate';
import { createTablePlugin } from './createTablePlugin';

let editor: TEditor;
beforeEach(() => {
  const computer = new Computer();
  editor = createPlateEditor({
    plugins: [createTablePlugin(computer)],
  });
});

it('normalizes empty table', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    {
      type: 'table',
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('inserts tds and ths if needed', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [],
        },
        {
          type: ELEMENT_TR,
          children: [],
        },
        {
          type: ELEMENT_TR,
          children: [],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
            },
          ],
        },
      ],
    },
  ]);
});

it('removes strange types of nodes inside a table', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('makes all rows the same size as header row', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('makes th and td elements contain only text elements', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [
                {
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'colName11' }],
                },
                {
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'colName12' }],
                },
              ],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [
                {
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'colName2' }],
                },
              ],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [
                {
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'value 1.1' }],
                },
                {
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'value 1.2' }],
                },
              ],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: 'value 2.1' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: 'value 2.2' }],
            },
          ],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName11' }],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName2' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: 'value 1.1' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: 'value 2.1' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: 'value 2.2' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('makes table have at least one row', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName11' }],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName2' }],
            },
          ],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName11' }],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName2' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('normalizes caption, th and td elements to contain only valid characters', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: 'caption&' }],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName1.1' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'caption' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: 'colName1' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('creates caption formulas when missing', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'caption' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              id: 'columnforumulaid',
              type: ELEMENT_TH,
              cellType: {
                kind: 'table-formula',
              },
              children: [{ text: 'colName1.1' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            },
          ],
        },
      ],
    } as TElement,
  ];
  normalizeEditor(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: 'table',
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [
                {
                  text: 'caption',
                },
              ],
            },
            {
              type: ELEMENT_TABLE_COLUMN_FORMULA,
              children: [
                {
                  text: '',
                },
              ],
              columnId: 'columnforumulaid',
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'table-formula',
              },
              children: [
                {
                  text: 'colName1',
                },
              ],
              id: 'columnforumulaid',
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              children: [
                {
                  text: '',
                },
              ],
              type: ELEMENT_TD,
            },
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});
