import { beforeEach, expect, describe, it, vi } from 'vitest';
import type { TEditor, TElement } from '@udecode/plate-common';
import { createPlateEditor, normalizeEditor } from '@udecode/plate-common';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { getComputer } from '@decipad/computer';
import { createTablePlugin } from './createTablePlugin';
import { timeout } from '@decipad/utils';

let editor: TEditor;

// To have nice and consistent IDs
vi.mock('nanoid', () => {
  let mockCounter = 0;
  return {
    nanoid: () => {
      mockCounter += 1;
      return `id-${mockCounter}`;
    },
  };
});

beforeEach(() => {
  const computer = getComputer();
  editor = createPlateEditor({
    plugins: [createTablePlugin(computer)],
  });
});

describe('normalizeTables plugin', () => {
  it('normalizes empty table', async () => {
    editor.children = [
      {
        type: ELEMENT_TABLE,
        children: [],
      },
    ];
    normalizeEditor(editor, { force: true });
    await timeout(100);
    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table",
                    },
                  ],
                  "id": "id-10",
                  "type": "table-var-name",
                },
              ],
              "id": "",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "id-12",
                  "type": "th",
                },
              ],
              "id": "id-11",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "id-14",
                  "type": "td",
                },
              ],
              "id": "id-13",
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('inserts tds and ths if needed', async () => {
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
    await timeout(100);
    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table",
                    },
                  ],
                  "id": "id-15",
                  "type": "table-var-name",
                },
              ],
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": undefined,
                  "type": "th",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": undefined,
                  "type": "td",
                },
              ],
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('removes strange types of nodes inside a table', async () => {
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

    await timeout(100);

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table",
                    },
                  ],
                  "id": "id-16",
                  "type": "table-var-name",
                },
              ],
              "id": "",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "id-18",
                  "type": "th",
                },
              ],
              "id": "id-17",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "id-20",
                  "type": "td",
                },
              ],
              "id": "id-19",
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('makes all rows the same size as header row', async () => {
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

    await timeout(100);

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table",
                    },
                  ],
                  "type": "table-var-name",
                },
              ],
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "type": "th",
                },
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "Column2",
                    },
                  ],
                  "type": "th",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "id-21",
                  "type": "td",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
              ],
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('makes th and td elements contain only text elements', async () => {
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

    await timeout(100);

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table",
                    },
                  ],
                  "type": "table-var-name",
                },
              ],
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "colName11",
                    },
                  ],
                  "type": "th",
                },
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "colName2",
                    },
                  ],
                  "type": "th",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "value 1.1value 1.2",
                    },
                  ],
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "id-22",
                  "type": "td",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "value 2.1",
                    },
                  ],
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "value 2.2",
                    },
                  ],
                  "type": "td",
                },
              ],
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('makes table have at least one row', async () => {
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

    await timeout(100);

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table",
                    },
                  ],
                  "type": "table-var-name",
                },
              ],
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "colName11",
                    },
                  ],
                  "type": "th",
                },
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "colName2",
                    },
                  ],
                  "type": "th",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "id-24",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "id-25",
                  "type": "td",
                },
              ],
              "id": "id-23",
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('normalizes caption, th and td elements to contain only valid characters', async () => {
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

    await timeout(100);

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "caption",
                    },
                  ],
                  "id": "id-26",
                  "type": "table-var-name",
                },
              ],
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "string",
                  },
                  "children": [
                    {
                      "text": "colName1",
                    },
                  ],
                  "type": "th",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
              ],
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });

  it('creates caption formulas when missing', async () => {
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

    await timeout(100);

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "caption",
                    },
                  ],
                  "type": "table-var-name",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "columnId": "columnforumulaid",
                  "id": "id-27",
                  "type": "table-column-formula",
                },
              ],
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "table-formula",
                  },
                  "children": [
                    {
                      "text": "colName1",
                    },
                  ],
                  "id": "columnforumulaid",
                  "type": "th",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
              ],
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "type": "td",
                },
              ],
              "type": "tr",
            },
          ],
          "type": "table",
        },
      ]
    `);
  });
});
