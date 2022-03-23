import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import {
  createPlateEditor,
  createPlugins,
  PlateEditor,
  TDescendant,
  TElement,
  TNode,
} from '@udecode/plate';
import { Descendant, Editor } from 'slate';
import { createNormalizeCodeBlockPlugin } from './createNormalizeCodeBlockPlugin';
import { codeLine, emptyCodeBlock, exampleCodeBlock } from './testUtils';

let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins([createNormalizeCodeBlockPlugin()]);
  editor = createPlateEditor({
    plugins,
  });
});

describe('in a code block', () => {
  it('wraps text in a code block in code lines', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [{ text: 'code' }],
      } as TNode,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_CODE_BLOCK,
        children: [codeLine('code')],
      },
    ]);
  });

  it('unwraps code lines from other elements', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [
          {
            type: ELEMENT_BLOCKQUOTE,
            children: [
              {
                type: ELEMENT_PARAGRAPH,
                children: [
                  {
                    type: ELEMENT_CODE_LINE,
                    children: [
                      {
                        text: 'code',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as TDescendant[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_CODE_BLOCK,
        children: [codeLine('code')],
      },
    ]);
  });
});

describe('in a code line', () => {
  it('merges all text', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [
          {
            type: ELEMENT_CODE_LINE,
            children: [
              { text: 'code' },
              { type: ELEMENT_PARAGRAPH, children: [{ text: '1' }] },
              { text: '2' },
              { type: ELEMENT_CODE_LINE, children: [{ text: '3' }] },
            ],
          },
        ],
      },
    ] as TDescendant[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_BLOCK, children: [codeLine('code123')] },
    ]);
  });

  it('does not allow marks', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [
          {
            type: ELEMENT_CODE_LINE,
            children: [{ text: 'code', bold: true, italic: false }],
          },
        ],
      },
    ] as TDescendant[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_BLOCK, children: [codeLine('code')] },
    ]);
  });
});

describe('statement-based line splitting and merging', () => {
  it('keeps one line intact', () => {
    editor.children = [emptyCodeBlock()];
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = 1',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = 1')],
      },
    ]);
  });

  it('keeps next empty line intact', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_node',
      path: [0, 3],
      node: codeLine(''),
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
          codeLine(''),
        ],
      },
    ]);
  });

  it('joins two code lines when they belong to the same statement', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 4,
      text: '(',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = (1\nt = {\n\n}\nb = 2')],
      },
    ]);
  });

  it('splits two or more lines when they belong to different statements', () => {
    editor.children = [emptyCodeBlock()];
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = (1\nt = {\n\n}\nb = 2',
    });
    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = (1\nt = {\n\n}\nb = 2')],
      },
    ]);
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 4,
      text: '(',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
        ],
      },
    ]);
  });

  it('allows removing a bit of the first line', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 4,
      text: '1',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('a = '), codeLine('t = {\n\n}'), codeLine('b = 2')],
      },
    ]);
  });

  it('allows enter after last line', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_node',
      path: [0, 3],
      node: {
        type: 'code_line',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
          codeLine(''),
        ],
      },
    ]);
  });

  it('allows adding some code to the new line', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_node',
      path: [0, 3],
      node: {
        type: 'code_line',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });
    editor.apply({
      type: 'insert_text',
      path: [0, 3, 0],
      offset: 4,
      text: 'g = {\n\n}',
    });
    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
          codeLine('g = {\n\n}'),
        ],
      },
    ]);
  });

  it('allows completely removing the content of the first line', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'remove_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'a = 1',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine(''), codeLine('t = {\n\n}'), codeLine('b = 2')],
      },
    ]);
  });

  it('applies a split and a merge at once', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [codeLine('123\n(42 +'), codeLine('1337)')],
      },
    ] as TDescendant[];
    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('123'), codeLine('(42 +\n1337)')],
      },
    ]);
  });

  it('allows adding a line before the first one', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_node',
      path: [0, 0],
      node: {
        type: 'code_line',
        children: [
          {
            text: '',
          },
        ],
      } as Descendant,
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine(''),
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
        ],
      },
    ]);
  });

  it('allows adding a newline char before the first one', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: '\n',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine(''),
          codeLine('a = 1'),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
        ],
      },
    ]);
  });

  it('a new line after the statement begins the next statement', () => {
    editor.children = [exampleCodeBlock()];
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 5,
      text: '\n',
    });

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine(''),
          codeLine('t = {\n\n}'),
          codeLine('b = 2'),
        ],
      },
    ]);
  });
});

it('normalizes a terribly broken node', () => {
  const { isInline } = editor;
  editor.isInline = (element) =>
    (element as TElement).type === 'nestedBullshit' || isInline(editor);
  editor.children = [
    {
      type: ELEMENT_CODE_BLOCK,
      children: [
        {
          type: 'bullshit',
          children: [
            { text: 'x=(' },
            {
              type: 'nestedBullshit',
              children: [{ text: '42' }],
            },
            { text: ')' },
          ],
        },
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text: 'y=42\nz=(' }],
        },
        { text: '42' },
      ],
    },
  ] as TDescendant[];

  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_CODE_BLOCK,
      children: [codeLine('x=(\n42\n)'), codeLine('y=42'), codeLine('z=(\n42')],
    },
  ]);
});
