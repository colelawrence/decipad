import { createPlateEditor, PlateEditor } from '@udecode/plate';
import {
  ELEMENT_COLUMNS,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  VariableDefinitionElement,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { hasLayoutAncestor, insertNodeIntoColumns } from './layout';

const mkDef = (text = ''): VariableDefinitionElement => ({
  type: ELEMENT_VARIABLE_DEF,
  id: text,
  variant: 'expression',
  children: [
    {
      type: ELEMENT_CAPTION,
      id: `${text}/caption`,
      color: 'color',
      icon: 'icon',
      children: [{ text }],
    },
    {
      type: ELEMENT_EXPRESSION,
      id: `${text}/expression`,
      children: [{ text }],
    },
  ],
});

let editor: PlateEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [
    { type: ELEMENT_VARIABLE_DEF, children: [{ text: '' }] },
    {
      type: ELEMENT_COLUMNS,
      children: [mkDef()],
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
    insertNodeIntoColumns(editor as MyEditor, mkDef('second'), [0]);
    expect(editor.children[0].type).toBe(ELEMENT_COLUMNS);
    expect(editor.children[0].children).toHaveLength(2);
  });

  it('inserts element into existing layout element', () => {
    insertNodeIntoColumns(editor as MyEditor, mkDef('second'), [1, 0]);
    expect(editor.children[1].type).toBe(ELEMENT_COLUMNS);
    expect(editor.children[1].children).toHaveLength(2);
  });
});
