import { getNodeString } from '@udecode/plate';
import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyElement,
  MyPlatePlugin,
} from '@decipad/editor-types';
import React from 'react';
import { createNormalizeCodeBlockPlugin } from '../NormalizeCodeBlock/createNormalizeCodeBlockPlugin';
import { createAutoFormatCodeBlockPlugin } from './createAutoFormatCodeBlockPlugin';
import { createNormalizeCodeLinePlugin } from '../NormalizeCodeLine';

let editor: MyEditor;
let plugin: MyPlatePlugin;
beforeEach(() => {
  plugin = createAutoFormatCodeBlockPlugin();
  editor = createTPlateEditor({
    plugins: [
      plugin,
      createNormalizeCodeBlockPlugin(),
      createNormalizeCodeLinePlugin(),
    ],
  });
});

const makeParagraph = (text: string): MyElement[] =>
  [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text }],
    },
  ] as MyElement[];

const makeCodeLine = (text: string): MyElement[] =>
  [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text }],
    },
  ] as MyElement[];

const renderEditorParagraph = (text: string) => {
  editor.children = makeParagraph(text) as never;

  editor.selection = {
    anchor: { path: [0, 0], offset: text.length },
    focus: { path: [0, 0], offset: text.length },
  };
};

const renderEditorCodeLine = (text: string) => {
  editor.children = makeCodeLine(text) as never;
  editor.selection = {
    anchor: { path: [0, 0], offset: text.length },
    focus: { path: [0, 0], offset: text.length },
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
  plugin.handlers.onKeyDown!(editor)(event as unknown as React.KeyboardEvent);

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

describe('Auto format code line plugin', () => {
  it('formats a paragraph to a code line when = is pressed at the start', () => {
    renderEditorParagraph('');
    pressKey('=');
    expect(editor.children).toEqual(makeCodeLine(''));
  });

  it('formats a paragraph to a code line when = is pressed following a variable', () => {
    renderEditorParagraph('hello ');
    pressKey('=');
    expect(editor.children).toEqual(makeCodeLine('hello ='));
  });

  it('formats a paragraph to a code line when = is pressed while holding shift on some keyboard layouts', () => {
    renderEditorParagraph('');
    pressKey('=', { shiftKey: true });
    expect(editor.children).toEqual(makeCodeLine(''));
  });

  it('does not format a paragraph to a code line when holding modifier keys', () => {
    renderEditorParagraph('');
    pressKey('=', { altKey: true });
    expect(editor.children).toEqual(makeParagraph(''));
  });

  it('goes back to a paragraph with just the identifier when pressing equal and backspace', () => {
    renderEditorParagraph('hello ');
    pressKey('=');
    pressKey('Backspace');
    expect(editor.children).toMatchObject(makeParagraph('hello ='));
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
    expect(editor.children).toEqual(makeCodeLine('hello ='));
  });

  it('does not go back to a paragraph from a code line created through other means', () => {
    renderEditorCodeLine('a =');
    pressKey('Backspace');
    expect(editor.children).toEqual(makeCodeLine('a '));
  });

  it('when removing a codeline it inserts a paragraph', () => {
    renderEditorCodeLine('');
    pressKey('Backspace');
    expect(editor.children).toEqual(makeParagraph(''));
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
    expect(editor.children).toEqual(makeCodeLine('hello = 10 apple'));
  });

  it('only undoes the code line that has been formatted', () => {
    // start with a code line and a paragraph
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'hello = 10 apples' }],
      },
      {
        id: '1',
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'hello2 ' }],
      },
    ] as never;

    // Press = on the paragraph, expect two code lines after
    editor.selection = {
      anchor: { path: [1, 0], offset: 'hello2 '.length },
      focus: { path: [1, 0], offset: 'hello2 '.length },
    };

    pressKey('=');

    expect(editor.children).toEqual([
      expect.objectContaining({ type: ELEMENT_CODE_LINE }),
      expect.objectContaining({ type: ELEMENT_CODE_LINE }),
    ]);
    expect(getNodeString(editor.children[1])).toEqual('hello2 =');

    // press backspace on the first code line, expect it to not format to a paragraph
    editor.selection = {
      anchor: { path: [0, 0], offset: 'hello = 10 apples'.length },
      focus: { path: [0, 0], offset: 'hello = 10 apples'.length },
    };

    pressKey('Backspace');

    // Press backspace on the formatted code line (second one) and expect it to undo to paragraph
    editor.selection = {
      anchor: { path: [1, 0], offset: 'hello2 ='.length },
      focus: { path: [1, 0], offset: 'hello2 ='.length },
    };

    pressKey('Backspace');

    expect(editor.children).toEqual([
      expect.objectContaining({ type: ELEMENT_CODE_LINE }),
      expect.objectContaining({ type: ELEMENT_PARAGRAPH }),
    ]);
    expect(getNodeString(editor.children[0])).toEqual('hello = 10 apple');
    expect(getNodeString(editor.children[1])).toEqual('hello2 =');
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
    ] as never;

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
      anchor: { path: [0, 0], offset: 'a ='.length },
      focus: { path: [0, 0], offset: 'a ='.length },
    };

    pressKey('Backspace');

    expect(editor.children[0]).toEqual(
      expect.objectContaining({ type: ELEMENT_CODE_LINE })
    );
    expect(getNodeString(editor.children[0])).toEqual('a ');
  });

  it('does not format to code line when text is not plain', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'a' }, { text: 'b ', bold: true }],
      },
    ] as never;

    editor.selection = {
      anchor: { path: [0, 1], offset: 'ab '.length },
      focus: { path: [0, 1], offset: 'ab '.length },
    };

    pressKey('=');

    expect(editor.children).toEqual([
      expect.objectContaining({ type: ELEMENT_PARAGRAPH }),
    ]);
    expect(getNodeString(editor.children[0])).toEqual('ab =');
  });
});
