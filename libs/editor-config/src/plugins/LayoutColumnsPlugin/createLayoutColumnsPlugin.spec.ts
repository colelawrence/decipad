import { createEditorPlugins, TElement } from '@udecode/plate';
import { Editor, Transforms } from 'slate';
import {
  ColumnsElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_COLUMNS,
  ELEMENT_INPUT,
  ELEMENT_PARAGRAPH,
  InputElement,
} from '@decipad/editor-types';
import { createLayoutColumnsPlugin } from './createLayoutColumnsPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createLayoutColumnsPlugin()],
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
        children: [{ type: ELEMENT_INPUT, children: [{ text: '' }] }],
      } as TElement,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_INPUT);
  });
  it('can contain 2 or more elements', () => {
    editor.children = [
      {
        type: ELEMENT_COLUMNS,
        children: [
          { type: ELEMENT_INPUT, children: [{ text: '' }] },
          { type: ELEMENT_INPUT, children: [{ text: '' }] },
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
        type: ELEMENT_INPUT,
        children: [{ text: '' }],
      } as InputElement,
      { at: [0, 0] }
    );
    Editor.normalize(editor, { force: true });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_COLUMNS);
    expect((editor.children[0] as ColumnsElement).children).toHaveLength(3);
  });
});
