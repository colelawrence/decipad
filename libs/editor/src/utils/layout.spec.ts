import { createPlateEditor, PlateEditor } from '@udecode/plate';
import {
  ELEMENT_COLUMNS,
  ELEMENT_INPUT,
  InputElement,
  MyEditor,
} from '@decipad/editor-types';
import { hasLayoutAncestor, insertNodeIntoColumns } from './layout';

let editor: PlateEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [
    { type: ELEMENT_INPUT, children: [{ text: '' }] },
    {
      type: ELEMENT_COLUMNS,
      children: [
        { type: ELEMENT_INPUT, children: [{ text: '' }] } as InputElement,
      ],
    },
  ];
});

describe('hasLayoutAncestor', () => {
  it('returns false if there is no layout element as parent', () => {
    expect(hasLayoutAncestor(editor as MyEditor, [0])).toBe(false);
  });

  it('returns true if it finds a parent layout element', () => {
    expect(hasLayoutAncestor(editor as MyEditor, [1, 0])).toBe(true);
  });
});

describe('insertNodeIntoColumns', () => {
  it('wraps path and new element into a layout element', () => {
    insertNodeIntoColumns(
      editor as MyEditor,
      {
        type: ELEMENT_INPUT,
        children: [{ text: 'second' }],
      } as unknown as InputElement,
      [0]
    );
    expect(editor.children[0].type).toBe(ELEMENT_COLUMNS);
    expect(editor.children[0].children).toHaveLength(2);
  });

  it('inserts element into existing layout element', () => {
    insertNodeIntoColumns(
      editor as MyEditor,
      {
        type: ELEMENT_INPUT,
        children: [{ text: 'second' }],
      } as unknown as InputElement,
      [1, 0]
    );
    expect(editor.children[1].type).toBe(ELEMENT_COLUMNS);
    expect(editor.children[1].children).toHaveLength(2);
  });
});
