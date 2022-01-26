import {
  createAutoformatPlugin,
  createEditorPlugins,
  SPEditor,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { createLinkPlugin } from '../../plugins/Link/createLinkPlugin';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
  Element,
  ELEMENT_LINK,
} from '../../elements';

import { autoformatLinks } from './autoformatLinks';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [
      createAutoformatPlugin({ rules: autoformatLinks }),
      createLinkPlugin(),
    ],
  });
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
  Transforms.select(editor, [0, 0]);
});

it('ignores input that is not a valid link', () => {
  editor.insertText('[a]b(c');
  editor.insertText(')');
  expect(editor.children).toEqual([
    { type: ELEMENT_PARAGRAPH, children: [{ text: '[a]b(c)' }] },
  ]);
});
it('ignores input outside a paragraph', () => {
  editor.children = [{ type: ELEMENT_H1, children: [{ text: '' }] }];
  editor.insertText('[a](b');
  editor.insertText(')');
  expect(editor.children).toEqual([
    { type: ELEMENT_H1, children: [{ text: '[a](b)' }] },
  ]);
});
it('ignores input that is already in a link', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        { type: ELEMENT_LINK, url: 'href', children: [{ text: 'link' }] },
      ],
    } as Element,
  ];
  Transforms.select(editor, { path: [0, 0, 0], offset: 2 });
  editor.insertText('[a](b)');
  expect(editor.children).toEqual([
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        { text: '' },
        { type: ELEMENT_LINK, url: 'href', children: [{ text: 'li[a](b)nk' }] },
        { text: '' },
      ],
    },
  ]);
});

it('splits off a link at the end', () => {
  editor.insertText('a[b](c');
  editor.insertText(')');
  expect(editor.children).toEqual([
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        { text: 'a' },
        { type: ELEMENT_LINK, url: 'c', children: [{ text: 'b' }] },
        { text: '' },
      ],
    },
  ]);
});
it('splits off a link at the start', () => {
  editor.insertText('c');
  Transforms.select(editor, { path: [0, 0], offset: 0 });
  editor.insertText('[a](b');
  editor.insertText(')');
  expect(editor.children).toEqual([
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        { text: '' },
        { type: ELEMENT_LINK, url: 'b', children: [{ text: 'a' }] },
        { text: 'c' },
      ],
    },
  ]);
});
it('can handle line breaks', () => {
  editor.insertText('a\nb[c\nd](e');
  editor.insertText(')');
  expect(editor.children).toEqual([
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        { text: 'a\nb' },
        { type: ELEMENT_LINK, url: 'e', children: [{ text: 'c\nd' }] },
        { text: '' },
      ],
    },
  ]);
});
