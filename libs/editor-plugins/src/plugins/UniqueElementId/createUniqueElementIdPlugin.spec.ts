import { createTPlateEditor, ELEMENT_TABLE_INPUT } from '@decipad/editor-types';
import { insertNodes, removeNodes, TEditor } from '@udecode/plate';
import { createUniqueElementIdPlugin } from './createUniqueElementIdPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createUniqueElementIdPlugin()],
  });
});

it('removes duplicate ids when starting', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    },
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    },
  ];
  editor.onChange();
  expect(editor.children[0].id).toBe('42');
  expect(editor.children[1].id).not.toBe('42');
});

it('detects duplicate element insertions and corrects them', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    },
  ];
  editor.onChange();
  insertNodes(
    editor,
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    },
    { at: [1] }
  );
  expect(editor.children[0].id).toBe('42');
  expect(editor.children[1].id).toBeDefined();
  expect(editor.children[1].id).not.toBe('42');
});

it('can reuse id after removal', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    },
  ];
  editor.onChange();
  removeNodes(editor, { at: [0] });
  insertNodes(
    editor,
    {
      type: ELEMENT_TABLE_INPUT,
      id: '42',
      children: [{ text: '' }],
      tableData: { variableName: 'table', columns: [] },
      extra: true,
    },
    { at: [0] }
  );
  expect(editor.children[0].id).toBe('42');
});
