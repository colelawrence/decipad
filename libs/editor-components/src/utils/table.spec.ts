import { Element, ELEMENT_TABLE } from '@decipad/editor-types';
import { Editor, createEditor } from 'slate';
import { insertTableBelow } from './table';

const getAvailableIdentifier = (prefix: string, start: number) =>
  `${prefix}${start}`;

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
    insertTableBelow(editor, [0], getAvailableIdentifier);
    expect(editor).toHaveProperty('children.1.type', ELEMENT_TABLE);
  });

  it('inserts a table element below the block containing given non-block path', () => {
    insertTableBelow(editor, [0, 0], getAvailableIdentifier);
    expect(editor).toHaveProperty('children.1.type', ELEMENT_TABLE);
  });
});
