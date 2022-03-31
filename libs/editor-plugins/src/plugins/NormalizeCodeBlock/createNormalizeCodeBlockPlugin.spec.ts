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
import { Editor } from 'slate';
import { createNormalizeCodeBlockPlugin } from './createNormalizeCodeBlockPlugin';
import { codeBlock, codeLine } from './testUtils';

let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins([createNormalizeCodeBlockPlugin()]);
  editor = createPlateEditor({
    plugins,
  });
});

describe('in a code block', () => {
  it('wraps text in a code block in code lines and unwraps code block', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [{ text: 'code' }],
      } as TNode,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([codeLine('code')]);
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
    expect(editor.children).toEqual([codeLine('code')]);
  });
});

describe('statement-based line splitting and merging', () => {
  it('keeps one line intact', () => {
    editor.children = [codeBlock(codeLine('a = 1'))];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([codeLine('a = 1')]);
  });

  it('keeps next empty line intact', () => {
    editor.children = [
      codeBlock(codeLine('a = 1'), codeLine('t = {\n\n}'), codeLine('b = 2')),
      codeLine(''),
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = 1'),
      codeLine('t = {\n\n}'),
      codeLine('b = 2'),
      codeLine(''),
    ]);
  });

  it('joins two code lines when they belong to the same statement', () => {
    editor.children = [
      codeBlock(codeLine('a = (1'), codeLine('t = {\n\n}'), codeLine('b = 2')),
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = (1\nt = {\n\n}\nb = 2'),
    ]);
  });

  it('splits two or more lines when they belong to different statements', () => {
    editor.children = [codeBlock(codeLine('a = 1\nt = {\n\n}\nb = 2'))];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = 1'),
      codeLine('t = {\n\n}'),
      codeLine('b = 2'),
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
      codeLine('123'),
      codeLine('(42 +\n1337)'),
    ]);
  });

  it('allows adding a line before the first one', () => {
    editor.children = [
      codeBlock(
        codeLine(''),
        codeLine('a = 1'),
        codeLine('t = {\n\n}'),
        codeLine('b = 2')
      ),
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine(''),
      codeLine('a = 1'),
      codeLine('t = {\n\n}'),
      codeLine('b = 2'),
    ]);
  });

  it('a new line after the statement begins the next statement', () => {
    editor.children = [
      codeBlock(
        codeLine('a = 1'),
        codeLine(''),
        codeLine('t = {\n\n}'),
        codeLine('b = 2')
      ),
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = 1'),
      codeLine(''),
      codeLine('t = {\n\n}'),
      codeLine('b = 2'),
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
    codeLine('x=(\n42\n)'),
    codeLine('y=42'),
    codeLine('z=(\n42'),
  ]);
});
