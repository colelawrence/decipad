import {
  createTPlateEditor,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { normalizeEditor } from '@udecode/plate';
import { createMigrateTableDropdownToId } from './createMigrateTableDropdownToId';

const editor = createTPlateEditor({
  plugins: [createMigrateTableDropdownToId()],
});

it('Replaces all expression ref with block ids', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [
                {
                  text: 'Table',
                },
              ],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'dropdown',
              },
              children: [
                {
                  text: 'Column 1',
                },
              ],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'anything',
              },
              children: [
                {
                  text: 'Column 2',
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
                  text: 'exprRef_1',
                },
              ],
            },
            {
              type: ELEMENT_TD,
              children: [
                {
                  text: 'text',
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
    } as never,
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
                  "kind": "dropdown",
                },
                "children": Array [
                  Object {
                    "text": "Column 1",
                  },
                ],
                "type": "th",
              },
              Object {
                "cellType": Object {
                  "kind": "anything",
                },
                "children": Array [
                  Object {
                    "text": "Column 2",
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
                    "text": "1",
                  },
                ],
                "type": "td",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "text",
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
