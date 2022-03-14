import { ELEMENT_H2, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import {
  createAutoformatPlugin,
  createEditorPlugins,
  SPEditor,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { autoformatMarks } from './autoformatMarks';

const initialText = '__*t';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createAutoformatPlugin({ rules: autoformatMarks })],
  });
  editor.children = [
    { type: ELEMENT_PARAGRAPH, children: [{ text: initialText }] },
  ];
  Transforms.select(editor, { path: [0, 0], offset: initialText.length });
});

it('formats text in paragraphs', () => {
  editor.insertText('*');
  editor.insertText('_');
  editor.insertText('_');
  expect(editor.children[0].children[0]).toHaveProperty('underline', true);
  expect(editor.children[0].children[0]).toHaveProperty('italic', true);
});

it('does not format text in a forbidden block', () => {
  editor.children = [{ type: ELEMENT_H2, children: [{ text: '' }] }];
  editor.insertText('*');
  editor.insertText('_');
  editor.insertText('_');
  expect(editor.children[0].children[0]).not.toHaveProperty('underline');
  expect(editor.children[0].children[0]).not.toHaveProperty('italic');
});
