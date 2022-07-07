import {
  createTPlateEditor,
  ELEMENT_IMAGE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeImagePlugin } from './createNormalizeImagePlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeImagePlugin()],
  });
});

it('is not a image without a url', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        {
          type: ELEMENT_IMAGE,
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
  ]);
});
it('is not a image with empty text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        {
          type: ELEMENT_IMAGE,
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
it('extra properties get stripped', () => {
  editor.children = [
    {
      type: ELEMENT_IMAGE,
      id: '1',
      url: 'https://http.cat/100.jpg',
      alt: 'foo',
      desc: 'bar',
      children: [{ text: 'alt' }],
      extra: true,
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_IMAGE,
      id: '1',
      url: 'https://http.cat/100.jpg',
      children: [{ text: 'alt' }],
    },
  ]);
});
