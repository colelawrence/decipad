/* eslint-disable jest/no-disabled-tests */
import { describe, it, expect, beforeEach } from 'vitest';
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
import { getComputer } from '@decipad/computer';
import { timeout } from '@decipad/utils';
import { createNormalizeCodeLinePlugin } from '@decipad/editor-plugin-factories';
import { createTrailingParagraphPlugin } from '../TrailingParagraph';

let editor: MyEditor;
let plugin: MyPlatePlugin;
beforeEach(() => {
  const computer = getComputer();
  plugin = createAutoFormatCodeLinePlugin(computer, undefined)();
  editor = createMyPlateEditor({
    plugins: [
      plugin,
      createTrailingParagraphPlugin(),
      createNormalizeCodeLinePlugin(computer),
    ],
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
});
