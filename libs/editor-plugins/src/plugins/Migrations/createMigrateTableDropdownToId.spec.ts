import { expect, it } from 'vitest';
import {
  createMyPlateEditor,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { normalizeEditor } from '@udecode/plate-common';
import { createMigrateTableDropdownToId } from './createMigrateTableDropdownToId';

const editor = createMyPlateEditor({
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
                  text: 'Column1',
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
                  text: 'Column2',
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
                  text: 'This exprRef_1 should be updated, and so should exprRef_2',
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
                  "kind": "dropdown",
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
                  "kind": "anything",
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
                    "text": "This 1 should be updated, and so should 2",
                  },
                ],
                "type": "td",
              },
              {
                "children": [
                  {
                    "text": "text",
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
