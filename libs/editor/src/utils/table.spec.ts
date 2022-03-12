import { Element, ELEMENT_TABLE_INPUT } from '@decipad/editor-types';
import { Editor, createEditor } from 'slate';
import { insertTableBelow } from './table';

describe('insertTableBelow', () => {
  let editor!: Editor;
  beforeEach(() => {
    editor = createEditor();
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        children: [{ text: '' }],
      },
    ] as Element[];
  });

  it('inserts a table element below given block path', () => {
    insertTableBelow(editor, [0]);
    expect(editor).toHaveProperty('children.1.type', ELEMENT_TABLE_INPUT);
  });

  it('inserts a table element below the block containing given non-block path', () => {
    insertTableBelow(editor, [0, 0]);
    expect(editor).toHaveProperty('children.1.type', ELEMENT_TABLE_INPUT);
  });
});
