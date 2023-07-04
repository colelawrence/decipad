import { createListPlugin, select, TEditor } from '@udecode/plate';
import {
  createTAutoformatPlugin,
  createTPlateEditor,
  ELEMENT_H2,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
} from '@decipad/editor-types';

import { autoformatLists } from './autoformatLists';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [
      createTAutoformatPlugin({ options: { rules: autoformatLists } }),
      createListPlugin(),
    ],
  });
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
  select(editor, [0, 0]);
});

describe('a block', () => {
  it('can be changed from a paragraph to an unordered list', () => {
    editor.insertText('*');
    editor.insertText(' ');
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_UL,
        children: [{ type: ELEMENT_LI }],
      },
    ]);
  });
  it('can be changed from a paragraph to an ordered list', () => {
    editor.insertText('1');
    editor.insertText('.');
    editor.insertText(' ');
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_OL,
        children: [{ type: ELEMENT_LI }],
      },
    ]);
  });

  it('cannot be changed to a list from a forbidden type', () => {
    editor.children = [{ type: ELEMENT_H2, children: [{ text: '' }] }];

    editor.insertText('*');
    editor.insertText(' ');
    expect(editor.children).toMatchObject([{ type: ELEMENT_H2 }]);
  });
});
