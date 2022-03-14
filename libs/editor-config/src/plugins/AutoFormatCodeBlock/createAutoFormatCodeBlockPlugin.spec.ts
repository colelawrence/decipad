import {
  Element,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { createEditorPlugins, PlatePlugin, SPEditor } from '@udecode/plate';
import { Editor, Node } from 'slate';
import { createNormalizeCodeBlockPlugin } from '../NormalizeCodeBlock/createNormalizeCodeBlockPlugin';
import { createAutoFormatCodeBlockPlugin } from './createAutoFormatCodeBlockPlugin';

let editor: Editor;
let plugin: PlatePlugin<SPEditor>;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [
      createAutoFormatCodeBlockPlugin(),
      createNormalizeCodeBlockPlugin(),
    ],
  });
  plugin = createAutoFormatCodeBlockPlugin();
});

const makeParagraph = (text: string): Element[] =>
  [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text }],
    },
  ] as Element[];

const makeCodeBlock = (text: string): Element[] =>
  [
    {
      type: ELEMENT_CODE_BLOCK,
      children: [
        {
          type: ELEMENT_CODE_LINE,
          children: [{ text }],
        },
      ],
    },
  ] as Element[];

const renderEditorParagraph = (text: string) => {
  editor.children = makeParagraph(text);

  editor.selection = {
    anchor: { path: [0, 0], offset: text.length },
    focus: { path: [0, 0], offset: text.length },
  };
};

const renderEditorCodeBlock = (text: string) => {
  editor.children = makeCodeBlock(text);
  editor.selection = {
    anchor: { path: [0, 0, 0], offset: text.length },
    focus: { path: [0, 0, 0], offset: text.length },
  };
};

const pressKey = (
  key: '=' | 'Backspace' | 'w',
  modifierKeys: Partial<Pick<KeyboardEvent, 'shiftKey' | 'altKey'>> = {}
) => {
  const event = new KeyboardEvent('keydown', {
    ...modifierKeys,
    key,
    cancelable: true,
  });

  // @ts-expect-error DOM KeyboardEvent vs React event
  plugin.onKeyDown?.(editor as SPEditor)(event);

  if (!event.defaultPrevented && !modifierKeys.altKey) {
    switch (key) {
      case '=':
        editor.insertText('=');
        break;
      case 'Backspace':
        editor.deleteBackward('character');
        break;
      case 'w':
        editor.insertText('w');
        break;
      default:
        throw new Error(`Do not know what to do with key ${key}`);
    }
  }
};

describe('Auto format code block plugin', () => {
  it('formats a paragraph to a code block when = is pressed at the start', () => {
    renderEditorParagraph('');
    pressKey('=');
    expect(editor.children).toEqual(makeCodeBlock(''));
  });

  it('formats a paragraph to a code block when = is pressed following a variable', () => {
    renderEditorParagraph('hello ');
    pressKey('=');
    expect(editor.children).toEqual(makeCodeBlock('hello ='));
  });

  it('formats a paragraph to a code block when = is pressed while holding shift on some keyboard layouts', () => {
    renderEditorParagraph('');
    pressKey('=', { shiftKey: true });
    expect(editor.children).toEqual(makeCodeBlock(''));
  });

  it('does not format a paragraph to a code block when holding modifier keys', () => {
    renderEditorParagraph('');
    pressKey('=', { altKey: true });
    expect(editor.children).toEqual(makeParagraph(''));
  });

  it('goes back to a paragraph with just the identifier when pressing equal and backspace', () => {
    renderEditorParagraph('hello ');
    pressKey('=');
    pressKey('Backspace');
    expect(editor.children).toEqual(makeParagraph('hello ='));
  });

  it('goes back to an empty paragraph when pressing equal and backspace', () => {
    renderEditorParagraph('');
    pressKey('=');
    pressKey('Backspace');
    expect(editor.children).toEqual(makeParagraph('='));
  });

  it('does not go back to a paragraph when holding modifier keys', () => {
    renderEditorParagraph('hello ');
    pressKey('=');
    pressKey('Backspace', { altKey: true });
    expect(editor.children).toEqual(makeCodeBlock('hello ='));
  });

  it('does not go back to a paragraph from a code block created through other means', () => {
    renderEditorCodeBlock('a =');
    pressKey('Backspace');
    expect(editor.children).toEqual(makeCodeBlock('a '));
  });

  it('does not format a paragraph that has spaces at the start', () => {
    renderEditorParagraph('      a ');
    pressKey('=');
    expect(editor.children).toEqual(makeParagraph('      a ='));
  });

  it('does not format a paragraph with two or more words', () => {
    renderEditorParagraph('hello world ');
    pressKey('=');
    expect(editor.children).toEqual(makeParagraph('hello world ='));
  });

  it('does not format a paragraph with number at the start', () => {
    renderEditorParagraph('123 ');
    pressKey('=');
    expect(editor.children).toEqual(makeParagraph('123 ='));
  });

  it('does not go back to a paragraph when text inserted after formatting', () => {
    renderEditorParagraph('hello ');
    pressKey('=');
    editor.insertText(' 10 apples');
    pressKey('Backspace');
    expect(editor.children).toEqual(makeCodeBlock('hello = 10 apple'));
  });

  it('only undoes the code block that has been formatted', () => {
    // start with a code block and a paragraph
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [
          {
            type: ELEMENT_CODE_LINE,
            children: [{ text: 'hello = 10 apples' }],
          },
        ],
      },
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'hello2 ' }],
      },
    ] as Element[];

    // Press = on the paragraph, expect two code blocks after
    editor.selection = {
      anchor: { path: [1, 0], offset: 'hello2 '.length },
      focus: { path: [1, 0], offset: 'hello2 '.length },
    };

    pressKey('=');

    expect(editor.children).toEqual([
      expect.objectContaining({ type: ELEMENT_CODE_BLOCK }),
      expect.objectContaining({ type: ELEMENT_CODE_BLOCK }),
    ]);
    expect(Node.string(editor.children[1])).toEqual('hello2 =');

    // press backspace on the first code block, expect it to not format to a paragraph
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 'hello = 10 apples'.length },
      focus: { path: [0, 0, 0], offset: 'hello = 10 apples'.length },
    };

    pressKey('Backspace');

    // Press backspace on the formatted code block (second one) and expect it to undo to paragraph
    editor.selection = {
      anchor: { path: [1, 0, 0], offset: 'hello2 ='.length },
      focus: { path: [1, 0, 0], offset: 'hello2 ='.length },
    };

    pressKey('Backspace');

    expect(editor.children).toEqual([
      expect.objectContaining({ type: ELEMENT_CODE_BLOCK }),
      expect.objectContaining({ type: ELEMENT_PARAGRAPH }),
    ]);
    expect(Node.string(editor.children[0])).toEqual('hello = 10 apple');
    expect(Node.string(editor.children[1])).toEqual('hello2 =');
  });

  it('does not go back to a paragraph after typing in a different block', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'a ' }],
      },
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'hello ' }],
      },
    ] as Element[];

    editor.selection = {
      anchor: { path: [0, 0], offset: 'a '.length },
      focus: { path: [0, 0], offset: 'a '.length },
    };

    pressKey('=');

    editor.selection = {
      anchor: { path: [1, 0], offset: 'hello '.length },
      focus: { path: [1, 0], offset: 'hello '.length },
    };

    pressKey('w');

    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 'a ='.length },
      focus: { path: [0, 0, 0], offset: 'a ='.length },
    };

    pressKey('Backspace');

    expect(editor.children[0]).toEqual(
      expect.objectContaining({ type: ELEMENT_CODE_BLOCK })
    );
    expect(Node.string(editor.children[0])).toEqual('a ');
  });

  it('does not format to code block when text is not plain', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'a' }, { text: 'b ', bold: true }],
      },
    ] as Element[];

    editor.selection = {
      anchor: { path: [0, 1], offset: 'ab '.length },
      focus: { path: [0, 1], offset: 'ab '.length },
    };

    pressKey('=');

    expect(editor.children).toEqual([
      expect.objectContaining({ type: ELEMENT_PARAGRAPH }),
    ]);
    expect(Node.string(editor.children[0])).toEqual('ab =');
  });
});
