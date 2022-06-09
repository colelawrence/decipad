import { ELEMENT_CODE_LINE, MyEditor } from '@decipad/editor-types';
import { createTEditor } from '@udecode/plate';
import { findWordStart, nextIsWordChar } from './autoComplete';

describe('findWordStart', () => {
  it('returns start location when cursor in on a [a-zA-Z0-9] word', () => {
    const editor = createTEditor() as MyEditor;
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'word' }],
      } as never,
    ];
    expect(findWordStart(editor, { path: [0, 0], offset: 3 })).toEqual({
      start: {
        offset: 0,
        path: [0, 0],
      },
      word: 'wor',
    });
  });

  it('returns current location when cursor in on punctuation', () => {
    const editor = createTEditor() as MyEditor;
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text: 'var = 3 +' }] } as never,
    ];
    expect(findWordStart(editor, { path: [0, 0], offset: 9 })).toEqual({
      start: {
        offset: 9,
        path: [0, 0],
      },
      word: '',
    });
  });
});

describe('nextIsWordChar', () => {
  it('returns true if next char is [a-zA-Z0-9]', () => {
    const editor = createTEditor() as MyEditor;
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text: 'word' }] } as never,
    ];
    expect(nextIsWordChar(editor, { path: [0, 0], offset: 3 })).toBe(true);
  });

  it('returns false if next char is not [a-zA-Z0-9]', () => {
    const editor = createTEditor() as MyEditor;
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text: 'var = 3 +' }] } as never,
    ];
    expect(nextIsWordChar(editor, { path: [0, 0], offset: 9 })).toBe(false);
  });

  it('returns false if there is no next char', () => {
    const editor = createTEditor() as MyEditor;
    editor.children = [
      { type: ELEMENT_CODE_LINE, children: [{ text: 'var' }] } as never,
    ];
    expect(nextIsWordChar(editor, { path: [0, 0], offset: 3 })).toBe(false);
  });
});
