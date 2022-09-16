import { insertNodes, normalizeEditor, TEditor } from '@udecode/plate';
import {
  ColumnsElement,
  createTPlateEditor,
  ELEMENT_COLUMNS,
  ELEMENT_PARAGRAPH,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { createNormalizeColumnsPlugin } from './createNormalizeColumnsPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeColumnsPlugin()],
  });
});

it('cannot be empty', () => {
  editor.children = [
    {
      type: ELEMENT_COLUMNS,
      children: [],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toHaveLength(0);
});

it('cannot contain elements other than interactive inputs', () => {
  editor.children = [
    {
      type: ELEMENT_COLUMNS,
      children: [
        { text: 'text' },
        { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
        { type: ELEMENT_CODE_LINE, children: [{ text: '' }] },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toHaveLength(2);
  expect(editor.children).not.toContainEqual(
    expect.objectContaining({ type: ELEMENT_COLUMNS })
  );
});

describe('with interactive elements as children', () => {
  it('cannot contain less than 2 elements', () => {
    editor.children = [
      {
        type: ELEMENT_COLUMNS,
        children: [{ type: ELEMENT_VARIABLE_DEF, children: [{ text: '' }] }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_VARIABLE_DEF);
  });
  it('can contain 2 or more elements', () => {
    editor.children = [
      {
        type: ELEMENT_COLUMNS,
        children: [
          { type: ELEMENT_VARIABLE_DEF, children: [{ text: '' }] },
          { type: ELEMENT_VARIABLE_DEF, children: [{ text: '' }] },
        ],
      },
    ];
    normalizeEditor(editor, { force: true });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_COLUMNS);
    expect((editor.children[0] as ColumnsElement).children).toHaveLength(2);

    insertNodes(
      editor,
      {
        type: ELEMENT_VARIABLE_DEF,
        children: [{ text: '' }],
      },
      { at: [0, 0] }
    );
    normalizeEditor(editor, { force: true });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_COLUMNS);
    expect((editor.children[0] as ColumnsElement).children).toHaveLength(3);
  });
});
