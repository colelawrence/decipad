import { createPlateEditor } from '@udecode/plate';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
} from '@decipad/editor-types';
import { Editor } from 'slate';
import { createNormalizeCodeLinePlugin } from './createNormalizeCodeLinePlugin';

const codeLine = (text = '') => ({
  type: ELEMENT_CODE_LINE,
  children: [{ text }],
});

describe('createNormalizeCodeLinePlugin', () => {
  it('inserts missing code line if no code line is there', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeCodeLinePlugin()],
    });
    editor.children = [];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([codeLine()]);
  });

  it('removes extra code lines', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeCodeLinePlugin()],
    });
    editor.children = [codeLine('a'), codeLine('b'), codeLine('c')];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([codeLine('a')]);
  });

  it('removes extra text nodes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeCodeLinePlugin()],
    });
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'a' }, { text: 'b' }],
      },
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([codeLine('a')]);
  });

  it('removes elements other than code lines', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeCodeLinePlugin()],
    });
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'a' }],
      },
      codeLine('b'),
      {
        type: ELEMENT_H1,
        children: [{ text: 'c' }],
      },
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([codeLine('b')]);
  });
});
