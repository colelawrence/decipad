import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import {
  TEditor,
  TElement,
  createPlateEditor,
  normalizeEditor,
} from '@udecode/plate-common';
import { createTablePlugin } from './createTablePlugin';
import { getRemoteComputer } from '@decipad/remote-computer';

let editor: TEditor;

// To have nice and consistent IDs
jest.mock('nanoid', () => {
  let mockCounter = 0;
  return {
    nanoid: () => {
      mockCounter += 1;
      return `id-${mockCounter}`;
    },
  };
});

beforeEach(() => {
  const computer = getRemoteComputer();
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
  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Table",
                  },
                ],
                "id": "id-2",
                "type": "table-var-name",
              },
            ],
            "id": undefined,
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "Column1",
                  },
                ],
                "id": "id-4",
                "type": "th",
              },
            ],
            "id": "id-3",
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "id-6",
                "type": "td",
              },
            ],
            "id": "id-5",
            "type": "tr",
          },
        ],
        "type": "table",
      },
    ]
  `);
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
  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Table",
                  },
                ],
                "id": "id-7",
                "type": "table-var-name",
              },
            ],
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "Column1",
                  },
                ],
                "id": undefined,
                "type": "th",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
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

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Table",
                  },
                ],
                "id": "id-8",
                "type": "table-var-name",
              },
            ],
            "id": undefined,
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "Column1",
                  },
                ],
                "id": "id-10",
                "type": "th",
              },
            ],
            "id": "id-9",
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "id-12",
                "type": "td",
              },
            ],
            "id": "id-11",
            "type": "tr",
          },
        ],
        "type": "table",
      },
    ]
  `);
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

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Table",
                  },
                ],
                "type": "table-var-name",
              },
            ],
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "Column1",
                  },
                ],
                "type": "th",
              },
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "Column2",
                  },
                ],
                "type": "th",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "type": "td",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "id-13",
                "type": "td",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "type": "td",
              },
              Object {
                "children": Array [
                  Object {
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

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Table",
                  },
                ],
                "type": "table-var-name",
              },
            ],
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "colName11",
                  },
                ],
                "type": "th",
              },
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "colName2",
                  },
                ],
                "type": "th",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "value 1.1value 1.2",
                  },
                ],
                "type": "td",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "id-14",
                "type": "td",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "value 2.1",
                  },
                ],
                "type": "td",
              },
              Object {
                "children": Array [
                  Object {
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

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Table",
                  },
                ],
                "type": "table-var-name",
              },
            ],
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "colName11",
                  },
                ],
                "type": "th",
              },
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "colName2",
                  },
                ],
                "type": "th",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "id-16",
                "type": "td",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "id-17",
                "type": "td",
              },
            ],
            "id": "id-15",
            "type": "tr",
          },
        ],
        "type": "table",
      },
    ]
  `);
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

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "caption",
                  },
                ],
                "id": "id-18",
                "type": "table-var-name",
              },
            ],
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "string",
                },
                "children": Array [
                  Object {
                    "text": "colName1",
                  },
                ],
                "type": "th",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "type": "td",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
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

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "caption",
                  },
                ],
                "type": "table-var-name",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "columnId": "columnforumulaid",
                "id": "id-19",
                "type": "table-column-formula",
              },
            ],
            "type": "table-caption",
          },
          Object {
            "children": Array [
              Object {
                "cellType": Object {
                  "kind": "table-formula",
                },
                "children": Array [
                  Object {
                    "text": "colName1",
                  },
                ],
                "id": "columnforumulaid",
                "type": "th",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "type": "td",
              },
            ],
            "type": "tr",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
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
