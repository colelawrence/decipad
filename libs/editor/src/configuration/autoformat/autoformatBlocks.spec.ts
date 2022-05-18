import {
  createTAutoformatPlugin,
  ELEMENT_CODE_LINE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import { createPlateEditor, select } from '@udecode/plate';
import { autoformatBlocks } from './autoformatBlocks';

let editor: MyEditor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [
      createTAutoformatPlugin({
        options: { rules: autoformatBlocks },
      }),
    ],
  });
  editor.children = [
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
  ] as unknown as MyValue;
  select(editor, [0, 0]);
});

describe('a block', () => {
  it('can be changed from paragraph to another type', () => {
    editor.insertText('#');
    editor.insertText(' ');
    expect(editor.children).toMatchObject([{ type: ELEMENT_H2 }]);
  });

  it('cannot be changed from a forbidden type', () => {
    editor.children = [
      { type: ELEMENT_H3, children: [{ text: '' }] },
    ] as unknown as MyValue;

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
    ] as unknown as MyValue;
    select(editor, { path: [0, 0], offset: 2 });

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
