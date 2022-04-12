import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_PARAGRAPH,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { createPlateEditor, PlateEditor } from '@udecode/plate';
import { insertInputBelow } from './input';

let editor: PlateEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
});

describe('insertInputBelow', () => {
  it('inserts an input element', () => {
    insertInputBelow(editor, [0]);
    expect(editor.children[1]).toMatchObject({
      type: ELEMENT_VARIABLE_DEF,
      children: [
        {
          type: ELEMENT_CAPTION,
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_EXPRESSION,
          children: [{ text: '' }],
        },
      ],
    });
  });
});
