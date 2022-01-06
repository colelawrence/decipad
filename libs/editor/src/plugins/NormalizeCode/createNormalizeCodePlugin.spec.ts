import {
  createEditorPlugins,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  SPEditor,
  TElement,
} from '@udecode/plate';
import { Editor } from 'slate';
import { createNormalizeCodePlugin } from './createNormalizeCodePlugin';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizeCodePlugin()],
  });
});

describe('in a code block', () => {
  it('wraps text in a code block in code lines', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [{ text: 'code' }],
      },
    ];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_CODE_BLOCK,
        children: [{ type: ELEMENT_CODE_LINE, children: [{ text: 'code' }] }],
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
    ] as TElement[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_CODE_BLOCK,
        children: [{ type: ELEMENT_CODE_LINE, children: [{ text: 'code' }] }],
      },
    ]);
  });
});

describe('in a code line', () => {
  it('merges all text', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [
          { text: 'code' },
          { type: ELEMENT_PARAGRAPH, children: [{ text: '1' }] },
          { text: '2' },
          { type: ELEMENT_CODE_LINE, children: [{ text: '3' }] },
        ],
      },
    ] as TElement[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_LINE, children: [{ text: 'code123' }] },
    ]);
  });

  it('does not allow marks', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'code', bold: true, italic: false }],
      },
    ] as TElement[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_LINE, children: [{ text: 'code' }] },
    ]);
  });
});
