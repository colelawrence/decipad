import { Editor } from 'slate';
import { createEditorPlugins, TElement } from '@udecode/plate';
import { Element, ELEMENT_LINK, ELEMENT_PARAGRAPH } from '../../elements';
import { MARK_BOLD } from '../../marks';
import { createNormalizeLinkPlugin } from './createNormalizeLinkPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizeLinkPlugin()],
  });
});

it('must have a url', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      children: [{ text: '' }],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: '',
      children: [{ text: '' }],
    },
  ] as Element[]);
});
it('cannot have extra properties', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      id: '42',
      url: 'https://example.com',
      children: [{ text: '' }],
      extra: true,
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      id: '42',
      url: 'https://example.com',
      children: expect.anything(),
    },
  ] as Element[]);
});

it('can contain plain text', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: '' }],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: '' }],
    },
  ] as Element[]);
});
it('can contain rich text', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: '', [MARK_BOLD]: true }],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: '', [MARK_BOLD]: true }],
    },
  ] as Element[]);
});

it('cannot contain other elements', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [
        { type: ELEMENT_LINK, children: [{ text: 'nested link.' }] },
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'par.' }] },
      ],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: 'nested link.par.' }],
    },
  ] as Element[]);
});
