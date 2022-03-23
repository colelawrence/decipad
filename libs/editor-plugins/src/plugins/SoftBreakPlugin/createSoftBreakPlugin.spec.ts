import {
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { createPlateEditor, TNode } from '@udecode/plate';
import { createSoftBreakPlugin } from './createSoftBreakPlugin';

const getNewEditorState = () => [
  {
    type: ELEMENT_CODE_BLOCK,
    id: 'id',
    children: [
      {
        type: ELEMENT_CODE_LINE,
        id: 'id',
        children: [
          {
            text: '[1, 2, 3]',
          },
        ],
      } as TNode,
    ],
  },
];

const codeLine = (code: string): CodeLineElement => {
  return {
    type: 'code_line',
    id: 'id',
    children: [
      {
        text: code,
      },
    ],
  };
};

describe('code lines', () => {
  it('soft breaks inside brackets', () => {
    const editor = createPlateEditor();
    editor.children = getNewEditorState();
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 7 },
      focus: { path: [0, 0, 0], offset: 7 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'enter',
      cancelable: true,
    });
    // @ts-expect-error DOM KeyboardEvent vs React event
    createSoftBreakPlugin()?.handlers?.onKeyDown(editor)(event);

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('[1, 2, \n3]')],
      },
    ]);
  });

  it('does not soft break outside brackets', () => {
    const editor = createPlateEditor();
    editor.children = getNewEditorState();
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 9 },
      focus: { path: [0, 0, 0], offset: 9 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'enter',
      cancelable: true,
    });
    // @ts-expect-error DOM KeyboardEvent vs React event
    createSoftBreakPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.children).toMatchObject([
      {
        type: 'code_block',
        children: [codeLine('[1, 2, 3]\n')],
      },
    ]);
  });

  describe('selecting text', () => {
    it('soft breaks', () => {
      const editor = createPlateEditor();
      editor.children = getNewEditorState();
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: '[1, 2'.length },
        focus: { path: [0, 0, 0], offset: '[1, 2, 3]'.length },
      };

      const event = new KeyboardEvent('keydown', {
        key: 'enter',
        cancelable: true,
      });
      // @ts-expect-error DOM KeyboardEvent vs React event
      createSoftBreakPlugin().handlers?.onKeyDown(editor)(event);
      expect(editor.children).toMatchObject([
        {
          type: 'code_block',
          children: [codeLine('[1, 2\n')],
        },
      ]);
      const forwardSelection = editor.children;

      editor.children = getNewEditorState();
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: '[1, 2, 3]'.length },
        focus: { path: [0, 0, 0], offset: '[1, 2'.length },
      };

      // @ts-expect-error DOM KeyboardEvent vs React event
      createSoftBreakPlugin().handlers?.onKeyDown(editor)(event);
      const backwardSelection = editor.children;

      expect(forwardSelection).toEqual(backwardSelection);
    });
  });
});
