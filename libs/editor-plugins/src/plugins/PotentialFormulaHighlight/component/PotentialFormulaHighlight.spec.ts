import {
  createTPlateEditor,
  DECORATE_POTENTIAL_FORMULA,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { TEditor } from '@udecode/plate';
import { BaseEditor } from 'slate';
import { commitPotentialFormula } from './PotentialFormulaHighlight';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor();
});

it('turns a decoration into a magic number and a code line', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hi 1 + 1 lol' }],
    },
  ];

  commitPotentialFormula(
    editor as BaseEditor,
    [0, 0],
    {
      [DECORATE_POTENTIAL_FORMULA]: true,
      text: '1 + 1',
      location: { anchor: 3, focus: 8 },
    },
    'id-of-thingy'
  );

  expect(editor.children).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "text": "hi ",
          },
          Object {
            "magicnumberz": true,
            "text": "exprRef_id_of_thingy",
          },
          Object {
            "text": " lol",
          },
        ],
        "type": "p",
      },
      Object {
        "children": Array [
          Object {
            "text": "1 + 1",
          },
        ],
        "id": "id-of-thingy",
        "type": "code_line",
      },
    ]
  `);
});
