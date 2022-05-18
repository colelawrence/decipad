import { ELEMENT_TABLE, MyEditor } from '@decipad/editor-types';
import { createTEditor } from '@udecode/plate';
import { insertTableBelow } from './table';

const getAvailableIdentifier = (prefix: string, start: number) =>
  `${prefix}${start}`;

describe('insertTableBelow', () => {
  let editor!: MyEditor;
  beforeEach(() => {
    editor = createTEditor() as MyEditor;
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        children: [{ text: '' }],
      } as never,
    ];
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
