import {
  createTPlateEditor,
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  MyElement,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeVoidPlugin } from './createNormalizeVoidPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
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
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
    },
  ] as MyElement[]);
});

it('adds missing property on a table input', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
    },
  ];
  normalizeEditor(editor, { force: true });
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
    },
  ];
  normalizeEditor(editor, { force: true });
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
  ] as MyElement[]);
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
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
      variableName: 'hello',
      value: 'there',
    },
  ] as MyElement[]);
});

it('adds missing properties on an input element', () => {
  editor.children = [
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_INPUT,
      id: '42',
      children: [{ text: '' }],
      variableName: '',
      value: '',
    },
  ] as MyElement[]);
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
        },
      ];
      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchObject([
        {
          type,
          children: [{ text: '' }],
        },
      ] as MyElement[]);
    });

    it('cannot have non-empty text', () => {
      editor.children = [
        {
          type,
          children: [{ text: 'text' }],
          tableData: { variableName: 'table', columns: [] }, // extraneous prop for tables
        },
      ];
      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchObject([
        {
          type,
          children: [{ text: '' }],
        },
      ] as MyElement[]);
    });
  }
);
