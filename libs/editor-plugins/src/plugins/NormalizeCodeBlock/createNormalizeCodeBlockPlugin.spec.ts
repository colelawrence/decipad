import {
  createTPlateEditor,
  ELEMENT_BLOCKQUOTE,
  DEPRECATED_ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { createPlugins, normalizeEditor, PlateEditor } from '@udecode/plate';
import {
  createNormalizeCodeBlockPlugin,
  createNormalizeCodeLinePlugin,
} from '..';
import { codeBlock, codeLine } from './testUtils';

// Here we're testing the code block and code line normalization together

let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins([
    createNormalizeCodeBlockPlugin(),
    createNormalizeCodeLinePlugin(),
  ]);
  editor = createTPlateEditor({
    plugins,
  }) as never;
});

describe('in a code block', () => {
  it('wraps text in a code block in code lines and unwraps code block', () => {
    editor.children = [
      {
        type: DEPRECATED_ELEMENT_CODE_BLOCK,
        children: [{ text: 'code' }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([codeLine('code')]);
  });

  it('unwraps code lines from other elements', () => {
    editor.children = [
      {
        type: DEPRECATED_ELEMENT_CODE_BLOCK,
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
    ];

    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([codeLine('code')]);
  });
});

describe('statement-based line splitting and merging', () => {
  it('keeps one line intact', () => {
    editor.children = [codeBlock(codeLine('a = 1'))];

    normalizeEditor(editor, { force: true });

    expect(editor.children).toMatchObject([codeLine('a = 1')]);
  });

  it('keeps next empty line intact', () => {
    editor.children = [
      codeBlock(codeLine('a = 1'), codeLine('t = {\n\n}'), codeLine('b = 2')),
      codeLine(''),
    ];

    normalizeEditor(editor, { force: true });

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

    normalizeEditor(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = (1\nt = {\n\n}\nb = 2'),
    ]);
  });

  it('splits two or more lines when they belong to different statements', () => {
    editor.children = [codeBlock(codeLine('a = 1\nt = {\n\n}\nb = 2'))];

    normalizeEditor(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = 1'),
      codeLine('t = {\n\n}'),
      codeLine('b = 2'),
    ]);
  });

  it('applies a split and a merge at once', () => {
    editor.children = [
      {
        type: DEPRECATED_ELEMENT_CODE_BLOCK,
        children: [codeLine('123\n(42 +'), codeLine('1337)')],
      },
    ];

    normalizeEditor(editor, { force: true });

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

    normalizeEditor(editor, { force: true });

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

    normalizeEditor(editor, { force: true });

    expect(editor.children).toMatchObject([
      codeLine('a = 1'),
      codeLine(''),
      codeLine('t = {\n\n}'),
      codeLine('b = 2'),
    ]);
  });
});
