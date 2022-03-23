import {
  Element,
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
} from '@decipad/editor-types';
import { createPlateEditor, TElement } from '@udecode/plate';
import { Editor } from 'slate';
import { createNormalizeVoidPlugin } from './createNormalizeVoidPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createPlateEditor({
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

it('adds missing property on a table input', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
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
  ]);
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
      'data-auth-url': '',
      'data-contenttype': '',
      'data-error': '',
      'data-external-data-source-id': '',
      'data-external-id': '',
      'data-provider': '',
      'data-varname': '',
    },
  ] as Element[]);
});

it('does not allow extra properties on an input element', () => {
  editor.children = [
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
      variableName: 'hello',
      value: 'there',
      extra: true,
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
      variableName: 'hello',
      value: 'there',
    },
  ] as Element[]);
});

it('adds missing properties on an input element', () => {
  editor.children = [
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
      variableName: '',
      value: '',
    },
  ] as Element[]);
});

describe.each([ELEMENT_TABLE_INPUT, ELEMENT_FETCH, ELEMENT_INPUT])(
  'a %s void element',
  (type) => {
    it('cannot have element children', () => {
      editor.children = [
        {
          type,
          children: [{ type: 'element', children: [{ text: '' }] }],
          tableData: { variableName: 'table', columns: [] }, // extraneous prop for tables
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toMatchObject([
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
          tableData: { variableName: 'table', columns: [] }, // extraneous prop for tables
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toMatchObject([
        {
          type,
          children: [{ text: '' }],
        },
      ] as Element[]);
    });
  }
);
