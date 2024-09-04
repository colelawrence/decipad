import { beforeEach, expect, it } from 'vitest';
import {
  createMyAutoformatPlugin,
  createMyPlateEditor,
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { select, TEditor } from '@udecode/plate-common';
import { autoformatMarks } from './autoformatMarks';

const initialText = '__*t';

let editor: TEditor;
beforeEach(() => {
  editor = createMyPlateEditor({
    plugins: [
      createMyAutoformatPlugin({
        options: { rules: autoformatMarks },
      }),
    ],
  });
  editor.children = [
    { type: ELEMENT_PARAGRAPH, children: [{ text: initialText }] },
  ];
  select(editor, { path: [0, 0], offset: initialText.length });
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

it('can highlight a paragraph', () => {
  editor = createMyPlateEditor({
    plugins: [
      createMyAutoformatPlugin({ options: { rules: autoformatMarks } }),
    ],
  });
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '==h' }] }];
  select(editor, { path: [0, 0], offset: initialText.length });
  editor.insertText('=');
  editor.insertText('=');
  expect(editor.children[0].children[0]).toEqual({ text: '==h==' });
});
