import {
  createTPlateEditor,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  markKinds,
  MyElement,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeLinkPlugin } from './createNormalizeLinkPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeLinkPlugin()],
  });
});

it('is not a link without a url', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        {
          type: ELEMENT_LINK,
          children: [{ text: 'text' }],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text' }],
    },
  ] as MyElement[]);
});
it('is not a link with empty text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        {
          type: ELEMENT_LINK,
          children: [{ text: '' }],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
  ]);
});
it('cannot have extra properties', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      id: '42',
      url: 'https://example.com',
      children: [{ text: 'text' }],
      extra: true,
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      id: '42',
      url: 'https://example.com',
      children: expect.anything(),
    },
  ] as MyElement[]);
});

it('can contain plain text', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: 'text' }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: 'text' }],
    },
  ]);
});
it('can contain rich text', () => {
  editor.children = [
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: 'text', [markKinds.MARK_BOLD]: true }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: 'text', [markKinds.MARK_BOLD]: true }],
    },
  ]);
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
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LINK,
      url: 'https://example.com',
      children: [{ text: 'nested link.par.' }],
    },
  ]);
});
