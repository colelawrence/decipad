import { Computer } from '@decipad/computer';
import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  MyEditor,
} from '@decipad/editor-types';
import { createAutoPairsPlugin } from './createAutoPairsPlugin';

const insert = (editor: MyEditor, key: string) => {
  const event = new KeyboardEvent('keydown', { key, cancelable: true });
  // @ts-expect-error DOM KeyboardEvent vs React event
  createAutoPairsPlugin(new Computer()).handlers?.onKeyDown?.(editor)(event);
  if (!event.defaultPrevented) {
    switch (true) {
      case '()[]{}'.includes(key):
        editor.insertText(key);
        break;
      case key === 'Backspace':
        editor.deleteBackward('character');
        break;
      default:
        throw new Error(`Do not know what to do with key ${key}`);
    }
  }
};

describe('in a code block', () => {
  it.each`
    key    | pair
    ${'('} | ${'()'}
    ${'['} | ${'[]'}
    ${'{'} | ${'{}'}
  `('expands to $pair when pressing $key', ({ key, pair }) => {
    const editor = createTPlateEditor();
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text: 'fn' }] } as never,
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    insert(editor, key);
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_LINE, children: [{ text: `fn${pair}` }] },
    ]);
  });

  it.each`
    key
    ${'('}
    ${'['}
    ${'{'}
  `('does not expand when $key is pressed with text on right', ({ key }) => {
    const editor = createTPlateEditor();
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text: 'fn' }] } as never,
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    insert(editor, key);
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_LINE, children: [{ text: `${key}fn` }] },
    ]);
  });

  it.each`
    key    | pair
    ${')'} | ${'(x)'}
    ${']'} | ${'[x]'}
    ${'}'} | ${'{x}'}
  `(
    'skips the $key in $pair when pressing it at the end of a pair',
    ({ key, pair }) => {
      const editor = createTPlateEditor();
      editor.children = [
        { type: ELEMENT_CODE_LINE, children: [{ text: pair }] } as never,
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };

      insert(editor, key);
      expect(editor.children).toEqual([
        { type: ELEMENT_CODE_LINE, children: [{ text: pair }] },
      ]);
      expect(editor.selection.anchor.offset).toBe(3);
    }
  );

  it.each`
    pair
    ${'()'}
    ${'[]'}
    ${'{}'}
  `(
    'deletes the whole pair when pressing backspace in the middle of a pair',
    ({ pair }) => {
      const editor = createTPlateEditor();
      editor.children = [
        { type: ELEMENT_CODE_LINE, children: [{ text: pair }] } as never,
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };

      insert(editor, 'Backspace');
      expect(editor.children).toEqual([
        { type: ELEMENT_CODE_LINE, children: [{ text: '' }] },
      ]);
    }
  );

  it('supports closing a paren before a \\n (not before the end of the code)', () => {
    const editor = createTPlateEditor();
    const fname = 'func';
    const text = '[\nfunc\n]';
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text }] } as never,
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: text.indexOf(fname) + fname.length },
      focus: { path: [0, 0], offset: text.indexOf(fname) + fname.length },
    };

    insert(editor, '(');
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_LINE, children: [{ text: '[\nfunc()\n]' }] },
    ]);
  });
});

describe('outside a code block', () => {
  it('does not expand a parenthesis', () => {
    const editor = createTPlateEditor();
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: 'John' }] } as never,
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    insert(editor, '(');
    expect(editor.children).toEqual([
      { type: ELEMENT_PARAGRAPH, children: [{ text: `John(` }] },
    ]);
  });
});
