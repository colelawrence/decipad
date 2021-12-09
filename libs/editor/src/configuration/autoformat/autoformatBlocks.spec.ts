import {
  createAutoformatPlugin,
  createEditorPlugins,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  SPEditor,
} from '@udecode/plate';
import { Transforms } from 'slate';

import { autoformatBlocks } from './autoformatBlocks';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createAutoformatPlugin({ rules: autoformatBlocks })],
  });
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
  Transforms.select(editor, [0, 0]);
});

describe('a block', () => {
  it('can be changed from paragraph to another type', () => {
    editor.insertText('#');
    editor.insertText('#');
    editor.insertText(' ');
    expect(editor.children).toMatchObject([{ type: ELEMENT_H2 }]);
  });

  it('cannot be changed from a forbidden type', () => {
    editor.children = [{ type: ELEMENT_H3, children: [{ text: '' }] }];

    editor.insertText('#');
    editor.insertText('#');
    editor.insertText(' ');
    expect(editor.children).toMatchObject([{ type: ELEMENT_H3 }]);
  });
});
describe('inserting a code block', () => {
  it('does not delete existing text', () => {
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
    ];
    Transforms.select(editor, { path: [0, 0], offset: 2 });

    editor.insertText('`');
    editor.insertText('`');
    editor.insertText('`');
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'text' }],
      },
      { type: ELEMENT_CODE_BLOCK },
    ]);
  });
});
