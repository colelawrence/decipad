import { expect, it } from 'vitest';
import {
  createMyPlateEditor,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { normalizeEditor } from '@udecode/plate-common';
import { createMigrateStructuredInputs } from './createMigrateStructuredIn';

const editor = createMyPlateEditor({
  plugins: [createMigrateStructuredInputs()],
});

it('Removes faulty structured input', () => {
  editor.children = [
    {
      type: ELEMENT_STRUCTURED_IN,
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          children: [
            {
              text: '',
            },
          ],
        },
      ],
    } as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toHaveLength(0);
});

it('Removes structured in with 2 children but wrong ones', () => {
  editor.children = [
    {
      type: ELEMENT_STRUCTURED_IN,
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          children: [
            {
              text: '',
            },
          ],
        },
        {
          text: 'not correct',
        },
      ],
    } as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toHaveLength(0);
});

it('Converts structured inputs to structured codelines', () => {
  editor.children = [
    {
      type: ELEMENT_STRUCTURED_IN,
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          children: [
            {
              text: 'VarName',
            },
          ],
        },
        {
          type: ELEMENT_STRUCTURED_IN_CHILD,
          children: [
            {
              text: '100',
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
                "text": "VarName",
              },
            ],
            "type": "structured_varname",
          },
          {
            "children": [
              {
                "text": "100",
              },
            ],
            "type": "code_line_v2_code",
          },
        ],
        "type": "code_line_v2",
      },
    ]
  `);
});
