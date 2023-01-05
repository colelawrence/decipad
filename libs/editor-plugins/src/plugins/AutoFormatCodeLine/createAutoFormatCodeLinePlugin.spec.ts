import { Computer } from '@decipad/computer';
import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyElement,
  MyPlatePlugin,
} from '@decipad/editor-types';
import React from 'react';
import { createAutoFormatCodeLinePlugin } from './createAutoFormatCodeLinePlugin';
import { createNormalizeCodeLinePlugin } from '../NormalizeCodeLine';

let editor: MyEditor;
let plugin: MyPlatePlugin;
beforeEach(() => {
  const computer = new Computer();
  plugin = createAutoFormatCodeLinePlugin(computer)();
  editor = createTPlateEditor({
    plugins: [plugin, createNormalizeCodeLinePlugin(computer)],
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
  [{ type: ELEMENT_CODE_LINE, children: [{ text }] }] as MyElement[];

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
    expect(editor.children).toMatchObject(makeCodeLine(''));
  });

  it('formats a paragraph to a code line when = is pressed while holding shift on some keyboard layouts', () => {
    renderEditorParagraph('');
    pressKey('=', { shiftKey: true });
    expect(editor.children).toMatchObject(makeCodeLine(''));
  });

  it('does not format a paragraph to a code line when holding modifier keys', () => {
    renderEditorParagraph('');
    pressKey('=', { altKey: true });
    expect(editor.children).toEqual(makeParagraph(''));
  });

  it('goes back to a paragraph when pressing equal and backspace', () => {
    renderEditorParagraph('');
    pressKey('=');
    pressKey('Backspace');
    expect(editor.children).toMatchObject(makeParagraph('='));
  });

  it('when removing a codeline it inserts a paragraph', () => {
    renderEditorCodeLine('');
    pressKey('Backspace');
    expect(editor.children).toMatchObject(makeParagraph(''));
  });
});
