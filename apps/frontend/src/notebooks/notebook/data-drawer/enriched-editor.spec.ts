import { describe, it, expect, beforeEach } from 'vitest';
import { createDataDrawerEditor } from './editor';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import { insertText } from '@udecode/plate-common';
import { PlainText, SmartRefElement } from '@decipad/editor-types';
import { DataDrawerEditorValue } from './types';

const makeChildren = (
  children: (PlainText | SmartRefElement)[]
): DataDrawerEditorValue => [
  {
    id: 'code_line_v2',
    type: 'code_line_v2',
    children: [
      {
        id: 'structured_varname',
        type: 'structured_varname',
        children: [{ text: 'myName' }],
      },
      {
        id: 'code_line_v2_code',
        type: 'code_line_v2_code',
        children,
      },
    ],
  },
];

describe('Selection helper enriched editor', () => {
  const editor = createDataDrawerEditor(getComputer());
  beforeEach(() => {
    editor.children = makeChildren([
      { text: 'TEXTA' },

      {
        type: 'smart-ref',
        id: 'ID-1',
        blockId: 'someBlockId',
        columnId: null,
        children: [{ text: '' }],
      } satisfies SmartRefElement,

      { text: 'TEXTB' },

      {
        type: 'smart-ref',
        id: 'ID-2',
        blockId: 'someBlockId2',
        columnId: null,
        children: [{ text: '' }],
      } satisfies SmartRefElement,

      { text: 'TEXTC' },
    ]);
  });
  it('Correctly inserts function into a text node', () => {
    editor.children = makeChildren([{ text: '1+1' }]);
    editor.select({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    });

    insertText(editor, '1+1');
    editor.insertOrWrapFunction('testFunc');
    expect(editor.children[0].children[1].children).toMatchInlineSnapshot(`
      [
        {
          "text": "1+1testFunc()1+1",
        },
      ]
    `);
  });

  it('Correctly wraps selection inside a text node with a function', () => {
    editor.insertOrWrapFunction('testFunc', {
      at: {
        anchor: { path: [0, 1, 2], offset: 4 },
        focus: { path: [0, 1, 2], offset: 0 },
      },
    });
    expect(editor.children[0].children[1].children).toMatchInlineSnapshot(`
      [
        {
          "text": "TEXTA",
        },
        {
          "blockId": "someBlockId",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-1",
          "type": "smart-ref",
        },
        {
          "text": "testFunc(TEXT)B",
        },
        {
          "blockId": "someBlockId2",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-2",
          "type": "smart-ref",
        },
        {
          "text": "TEXTC",
        },
      ]
    `);
  });
  it('Correctly wraps selection around a SmartRef with a function', () => {
    editor.insertOrWrapFunction('testFunc', {
      at: {
        anchor: { path: [0, 1, 1], offset: 0 },
        focus: { path: [0, 1, 1], offset: 0 },
      },
    });
    expect(editor.children[0].children[1].children).toMatchInlineSnapshot(`
      [
        {
          "text": "TEXTAtestFunc(",
        },
        {
          "blockId": "someBlockId",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-1",
          "type": "smart-ref",
        },
        {
          "text": ")TEXTB",
        },
        {
          "blockId": "someBlockId2",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-2",
          "type": "smart-ref",
        },
        {
          "text": "TEXTC",
        },
      ]
    `);
  });

  it('Correctly wraps selection from a text node to a SmartRef with a function', () => {
    editor.insertOrWrapFunction('testFunc', {
      at: {
        anchor: { path: [0, 1, 0], offset: 4 },
        focus: { path: [0, 1, 3], offset: 0 },
      },
    });
    expect(editor.children[0].children[1].children).toMatchInlineSnapshot(`
      [
        {
          "text": "TEXTtestFunc(A",
        },
        {
          "blockId": "someBlockId",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-1",
          "type": "smart-ref",
        },
        {
          "text": "TEXTB",
        },
        {
          "blockId": "someBlockId2",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-2",
          "type": "smart-ref",
        },
        {
          "text": ")TEXTC",
        },
      ]
    `);
  });

  it('Correctly wraps selection from a SmartRef to a text node with a function', () => {
    editor.insertOrWrapFunction('testFunc', {
      at: {
        anchor: { path: [0, 1, 1], offset: 0 },
        focus: { path: [0, 1, 4], offset: 1 },
      },
    });
    expect(editor.children[0].children[1].children).toMatchInlineSnapshot(`
      [
        {
          "text": "TEXTAtestFunc(",
        },
        {
          "blockId": "someBlockId",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-1",
          "type": "smart-ref",
        },
        {
          "text": "TEXTB",
        },
        {
          "blockId": "someBlockId2",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "ID-2",
          "type": "smart-ref",
        },
        {
          "text": "T)EXTC",
        },
      ]
    `);
  });

  it('Correctly wraps selection from a text node to a text node with a function', () => {
    editor.insertOrWrapFunction('testFunc', {
      at: {
        anchor: { path: [0, 1, 0], offset: 4 },
        focus: { path: [0, 1, 4], offset: 1 },
      },
    });
    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "text": "myName",
                },
              ],
              "id": "structured_varname",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "TEXTtestFunc(A",
                },
                {
                  "blockId": "someBlockId",
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "columnId": null,
                  "id": "ID-1",
                  "type": "smart-ref",
                },
                {
                  "text": "TEXTB",
                },
                {
                  "blockId": "someBlockId2",
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "columnId": null,
                  "id": "ID-2",
                  "type": "smart-ref",
                },
                {
                  "text": "T)EXTC",
                },
              ],
              "id": "code_line_v2_code",
              "type": "code_line_v2_code",
            },
          ],
          "id": "code_line_v2",
          "type": "code_line_v2",
        },
      ]
    `);
  });

  it('Correctly wraps selection from a SmartRef to a SmartRef with a function', () => {
    editor.insertOrWrapFunction('testFunc', {
      at: {
        anchor: { path: [0, 1, 1], offset: 0 },
        focus: { path: [0, 1, 3], offset: 0 },
      },
    });
    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "text": "myName",
                },
              ],
              "id": "structured_varname",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "TEXTAtestFunc(",
                },
                {
                  "blockId": "someBlockId",
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "columnId": null,
                  "id": "ID-1",
                  "type": "smart-ref",
                },
                {
                  "text": "TEXTB",
                },
                {
                  "blockId": "someBlockId2",
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "columnId": null,
                  "id": "ID-2",
                  "type": "smart-ref",
                },
                {
                  "text": ")TEXTC",
                },
              ],
              "id": "code_line_v2_code",
              "type": "code_line_v2_code",
            },
          ],
          "id": "code_line_v2",
          "type": "code_line_v2",
        },
      ]
    `);
  });
});
