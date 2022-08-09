import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_PARAGRAPH,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
} from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate';
import { insertInputBelow } from './input';

const getAvailableIdentifier = (prefix: string, start: number) =>
  `${prefix}${start}`;

let editor: MyEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] } as never,
  ];
});

describe('insertInputBelow', () => {
  it('inserts an input element', () => {
    insertInputBelow(editor, [0], getAvailableIdentifier);
    expect(editor.children[1]).toMatchObject({
      type: ELEMENT_VARIABLE_DEF,
      children: [
        {
          type: ELEMENT_CAPTION,
          children: [{ text: 'Input1' }],
        },
        {
          type: ELEMENT_EXPRESSION,
          children: [{ text: '' }],
        },
      ],
    });
  });
});
