/* eslint-disable jest/no-disabled-tests */
import type React from 'react';
import type { MyEditor, MyElement, MyPlatePlugin } from '@decipad/editor-types';
import {
  createMyPlateEditor,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_PARAGRAPH,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { createAutoFormatCodeLinePlugin } from './createAutoFormatCodeLinePlugin';
import { createNormalizeCodeLinePlugin } from '../NormalizeCodeLine';
import { getComputer } from '@decipad/computer';
import { timeout } from '@decipad/utils';

let editor: MyEditor;
let plugin: MyPlatePlugin;
beforeEach(() => {
  const computer = getComputer();
  plugin = createAutoFormatCodeLinePlugin(computer)();
  editor = createMyPlateEditor({
    plugins: [plugin, createNormalizeCodeLinePlugin(computer)],
  });
});

const makeParagraph = (text = ''): MyElement[] =>
  [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text }],
    },
  ] as MyElement[];

const makeCodeLine = (): MyElement =>
  ({
    type: ELEMENT_CODE_LINE_V2,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
      },
    ],
  } as MyElement);

const renderEditorParagraph = (text: string) => {
  editor.children = makeParagraph(text) as never;

  editor.selection = {
    anchor: { path: [0, 0], offset: text.length },
    focus: { path: [0, 0], offset: text.length },
  };
};

const renderEditorCodeLine = () => {
  editor.children = makeCodeLine() as never;
  const end = { path: [0, 1], offset: 0 };
  editor.selection = {
    anchor: end,
    focus: end,
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
  it('formats a paragraph to a code line when = is pressed at the start', async () => {
    renderEditorParagraph('');
    pressKey('=');
    await timeout(100);
    expect(editor.children).toMatchObject([
      makeCodeLine(),
      { type: ELEMENT_PARAGRAPH },
    ]);
  });

  it('formats a paragraph to a code line when = is pressed while holding shift on some keyboard layouts', async () => {
    renderEditorParagraph('');
    pressKey('=', { shiftKey: true });
    await timeout(100);
    expect(editor.children).toMatchObject([
      makeCodeLine(),
      { type: ELEMENT_PARAGRAPH },
    ]);
  });

  it('does not format a paragraph to a code line when holding modifier keys', async () => {
    renderEditorParagraph('');
    pressKey('=', { altKey: true });
    expect(editor.children).toEqual(makeParagraph());
  });

  it.skip('goes back to a paragraph when pressing equal and backspace', () => {
    renderEditorParagraph('');
    pressKey('=');
    pressKey('Backspace');
    expect(editor.children).toMatchObject(makeParagraph('='));
  });

  it.skip('when removing a codeline it inserts a paragraph', () => {
    renderEditorCodeLine();
    pressKey('Backspace');
    expect(editor.children).toMatchObject(makeParagraph(''));
  });
});
