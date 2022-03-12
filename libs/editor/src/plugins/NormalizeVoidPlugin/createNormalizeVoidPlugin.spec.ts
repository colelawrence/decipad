import { Editor } from 'slate';
import { createEditorPlugins, TElement } from '@udecode/plate';
import {
  Element,
  ELEMENT_TABLE_INPUT,
  ELEMENT_FETCH,
} from '@decipad/editor-types';
import { createNormalizeVoidPlugin } from './createNormalizeVoidPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizeVoidPlugin()],
  });
});

it('does not allow extra properties on a table input', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
    },
  ] as Element[]);
});

it('does not allow extra properties on a fetch element', () => {
  editor.children = [
    {
      type: ELEMENT_FETCH,
      id: '42',
      children: [{ text: '' }],
      'data-href': 'https://example.com',
      extra: true,
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_FETCH,
      id: '42',
      children: [{ text: '' }],
      'data-href': 'https://example.com',
    },
  ] as Element[]);
});

describe.each([ELEMENT_TABLE_INPUT, ELEMENT_FETCH])(
  'a %s void element',
  (type) => {
    it('cannot have element children', () => {
      editor.children = [
        {
          type,
          children: [{ type: 'element', children: [{ text: '' }] }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          children: [{ text: '' }],
        },
      ] as Element[]);
    });

    it('cannot have non-empty text', () => {
      editor.children = [
        {
          type,
          children: [{ text: 'text' }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          children: [{ text: '' }],
        },
      ] as Element[]);
    });
  }
);
