import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { TEditor } from '@udecode/plate-common';
import { createEditor } from 'slate';
import {
  createNormalizer,
  elementKindsToDefaults,
  normalizeElement,
} from './element-normalizer';
import { normalizeCurried } from '../normalizeNode';

vi.mock('nanoid', () => {
  return {
    nanoid: () => 'mocked-id',
  };
});

describe('element type map', () => {
  it('snapshots entire map', () => {
    expect(elementKindsToDefaults).toMatchInlineSnapshot(`
      {
        "data-tab-children": {
          "children": [
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "mocked-id",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "mocked-id",
              "type": "code_line_v2_code",
            },
          ],
          "id": "mocked-id",
          "type": "data-tab-children",
        },
      }
    `);
  });
});

describe('Default normalizer for every element', () => {
  it('inserts first missing node for single element', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        { type: ELEMENT_DATA_TAB_CHILDREN, children: [] } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "node": {
          "children": [
            {
              "text": "",
            },
          ],
          "id": "mocked-id",
          "type": "structured_varname",
        },
        "path": [
          0,
          0,
        ],
        "type": "insert_node",
      }
    `);
  });

  it('inserts first node if it is missing', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        {
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            { type: ELEMENT_CODE_LINE_V2_CODE, children: [{ text: 'code' }] },
          ],
        } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "node": {
          "children": [
            {
              "text": "",
            },
          ],
          "id": "mocked-id",
          "type": "structured_varname",
        },
        "path": [
          0,
          0,
        ],
        "type": "insert_node",
      }
    `);
  });

  it('moves nodes in place if they exist', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        {
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            { type: ELEMENT_CODE_LINE_V2_CODE, children: [{ text: 'code' }] },
            {
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: 'varname' }],
            },
          ],
        } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "newPath": [
          0,
          0,
        ],
        "path": [
          0,
          1,
        ],
        "type": "move_node",
      }
    `);
  });

  it('removes extra nodes', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        {
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            {
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: 'varname' }],
            },
            { type: ELEMENT_CODE_LINE_V2_CODE, children: [{ text: 'code' }] },
            {
              type: ELEMENT_CODE_LINE_V2_CODE,
              children: [{ text: 'extra-code' }],
            },
          ],
        } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "node": {
          "children": [
            {
              "text": "extra-code",
            },
          ],
          "type": "code_line_v2_code",
        },
        "path": [
          0,
          2,
        ],
        "type": "remove_node",
      }
    `);
  });
});

describe('Normalizes on an actual editor', () => {
  let editor = createEditor() as TEditor;

  beforeEach(() => {
    editor = createEditor() as TEditor;
  });

  it('normalizes workspace numbers', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_DATA_TAB_CHILDREN)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [],
      },
    ];

    editor.normalize();

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "mocked-id",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "mocked-id",
              "type": "code_line_v2_code",
            },
          ],
          "type": "data-tab-children",
        },
      ]
    `);
  });

  it('normalizes workspace numbers if elements are out of order', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_DATA_TAB_CHILDREN)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: 'code' }],
          },
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'varname' }],
          },
        ],
      },
    ];

    editor.normalize();

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "text": "varname",
                },
              ],
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "code",
                },
              ],
              "type": "code_line_v2_code",
            },
          ],
          "type": "data-tab-children",
        },
      ]
    `);
  });
});
