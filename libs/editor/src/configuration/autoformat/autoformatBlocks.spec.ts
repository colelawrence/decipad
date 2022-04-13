import {
  ELEMENT_CODE_LINE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import {
  createAutoformatPlugin,
  createPlateEditor,
  PlateEditor,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { autoformatBlocks } from './autoformatBlocks';

let editor: PlateEditor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [createAutoformatPlugin({ options: { rules: autoformatBlocks } })],
  });
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
  Transforms.select(editor, [0, 0]);
});

describe('a block', () => {
  it('can be changed from paragraph to another type', () => {
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

  it('can create an horizontal rule', () => {
    editor.insertText('-');
    expect(editor.children).toMatchObject([{ type: ELEMENT_PARAGRAPH }]);
    editor.insertText('-');
    expect(editor.children).toMatchObject([{ type: ELEMENT_PARAGRAPH }]);
    editor.insertText('-');
    expect(editor.children).toMatchObject([{ type: ELEMENT_HR }]);
  });

  it('can create an horizontal rule with tilde', () => {
    editor.insertText('~');
    expect(editor.children).toMatchObject([{ type: ELEMENT_PARAGRAPH }]);
    editor.insertText('~');
    expect(editor.children).toMatchObject([{ type: ELEMENT_PARAGRAPH }]);
    editor.insertText('~');
    expect(editor.children).toMatchObject([{ type: ELEMENT_HR }]);
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
      { type: ELEMENT_CODE_LINE },
    ]);
  });
});
