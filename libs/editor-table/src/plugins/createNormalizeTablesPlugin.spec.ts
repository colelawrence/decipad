import {
  ELEMENT_TABLE,
  ELEMENT_TR,
  ELEMENT_PARAGRAPH,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TABLE_CAPTION,
} from '@decipad/editor-types';
import { createPlateEditor, TElement } from '@udecode/plate';
import { Editor } from 'slate';
import { createNormalizeTablesPlugin } from './createNormalizeTablesPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [createNormalizeTablesPlugin()],
  });
});

it('normalizes empty table', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toMatchObject([
    {
      type: 'table',
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: '' }],
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
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: '' }],
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
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: '' }],
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
          children: [{ text: 'varName' }],
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
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: 'varName' }],
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
          children: [{ text: '' }],
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
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: '' }],
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

it('makes table have at least two rows', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: '' }],
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
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: '' }],
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
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });

  expect(editor.children).toMatchObject([
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [{ text: 'caption' }],
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
