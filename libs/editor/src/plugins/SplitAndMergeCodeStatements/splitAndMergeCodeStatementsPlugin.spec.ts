import { createEditor, Descendant } from 'slate';
import { WithSplitAndMergeCodeStatements } from './createSplitAndMergeCodeStatementsPlugin';

describe('splitAndMergeCodeStatementsPlugin', () => {
  const plugin = WithSplitAndMergeCodeStatements();
  const editor = plugin(createEditor());
  editor.children = [
    {
      type: 'code_block',
      children: [
        {
          type: 'code_line',
          children: [
            {
              text: '',
            },
          ],
        } as Descendant,
      ],
    } as Descendant,
  ];

  it('keeps one line intact', () => {
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = 1',
    });

    expect(editor.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "a = 1",
                },
              ],
              "type": "code_line",
            },
          ],
          "type": "code_block",
        },
      ]
      `);
  });

  it('keeps next empty line intact', () => {
    editor.apply({
      type: 'insert_node',
      path: [0, 1],
      node: {
        type: 'code_block',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });

    expect(editor.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "a = 1",
                },
              ],
              "type": "code_line",
            },
            Object {
              "children": Array [
                Object {
                  "text": "",
                },
              ],
              "type": "code_block",
            },
          ],
          "type": "code_block",
        },
      ]
      `);
  });

  it('keeps next line with code intact', () => {
    editor.apply({
      type: 'insert_text',
      path: [0, 1, 0],
      offset: 0,
      text: 'b = 2',
    });

    expect(editor.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "a = 1",
                },
              ],
              "type": "code_line",
            },
            Object {
              "children": Array [
                Object {
                  "text": "b = 2",
                },
              ],
              "type": "code_block",
            },
          ],
          "type": "code_block",
        },
      ]
      `);
  });

  it('joins two code lines when they belong to the same statement', () => {
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 4,
      text: '(',
    });

    expect(editor.children).toMatchInlineSnapshot(`
Array [
  Object {
    "children": Array [
      Object {
        "children": Array [
          Object {
            "text": "a = (1\nb = 2",
          },
        ],
        "type": "code_line",
      },
    ],
    "type": "code_block",
  },
]
`);
  });

  it('splits two lines when they belong to different statements', () => {
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 4,
      text: '(',
    });

    expect(editor.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "a = 1",
                },
              ],
              "type": "code_line",
            },
            Object {
              "children": Array [
                Object {
                  "text": "b = 2",
                },
              ],
              "type": "code_line",
            },
          ],
          "type": "code_block",
        },
      ]
      `);
  });

  it('allows removing a bit of the first line', () => {
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 4,
      text: '1',
    });

    expect(editor.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "a = ",
                },
              ],
              "type": "code_line",
            },
            Object {
              "children": Array [
                Object {
                  "text": "b = 2",
                },
              ],
              "type": "code_line",
            },
          ],
          "type": "code_block",
        },
      ]
      `);
  });
});
