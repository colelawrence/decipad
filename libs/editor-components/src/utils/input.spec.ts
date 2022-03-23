import { ELEMENT_INPUT, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
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
      type: ELEMENT_INPUT,
      variableName: '',
      value: '',
      children: [{ text: '' }],
    });
  });
});
