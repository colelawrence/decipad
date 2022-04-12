import { createPlateEditor, TElement } from '@udecode/plate';
import { Editor, Node, Transforms } from 'slate';
import {
  ColumnsElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_COLUMNS,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { createNormalizeColumnsPlugin } from './createNormalizeColumnsPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [createNormalizeColumnsPlugin()],
  });
});

it('cannot be empty', () => {
  editor.children = [
    {
      type: ELEMENT_COLUMNS,
      children: [],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toHaveLength(0);
});

it('cannot contain elements other than interactive inputs', () => {
  editor.children = [
    {
      type: ELEMENT_COLUMNS,
      children: [
        { text: 'text' },
        { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
        { type: ELEMENT_CODE_BLOCK, children: [{ text: '' }] },
      ],
    } as TElement,
  ];
  Editor.normalize(editor, { force: true });
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
      } as TElement,
    ];
    Editor.normalize(editor, { force: true });
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
      } as TElement,
    ];
    Editor.normalize(editor, { force: true });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_COLUMNS);
    expect((editor.children[0] as ColumnsElement).children).toHaveLength(2);

    Transforms.insertNodes(
      editor,
      {
        type: ELEMENT_VARIABLE_DEF,
        children: [{ text: '' }],
      } as Node,
      { at: [0, 0] }
    );
    Editor.normalize(editor, { force: true });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_COLUMNS);
    expect((editor.children[0] as ColumnsElement).children).toHaveLength(3);
  });
});
