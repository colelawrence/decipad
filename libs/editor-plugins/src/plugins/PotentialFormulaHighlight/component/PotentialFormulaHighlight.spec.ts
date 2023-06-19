import { Computer } from '@decipad/computer';
import {
  createTPlateEditor,
  DECORATE_POTENTIAL_FORMULA,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { TEditor } from '@udecode/plate';
import { createInlineNumberPlugin } from '../../MagicNumber/createInlineNumberPlugin';
import { commitPotentialFormula } from './PotentialFormulaHighlight';

let editor: TEditor;
let computer: Computer;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createInlineNumberPlugin()],
  });
  computer = new Computer();
});

it('turns a decoration into a magic number and a code line', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hi 1 + 1 lol' }],
    },
  ];

  commitPotentialFormula(
    editor as any,
    computer,
    [0, 0],
    {
      [DECORATE_POTENTIAL_FORMULA]: true,
      text: '1 + 1',
      location: { anchor: 3, focus: 8 },
    },
    'inline',
    noop,
    'id-of-thingy'
  );

  expect(editor.children.length).toBeLessThan(3);

  // It has code line in the end
  expect(editor.children[1]).toMatchInlineSnapshot(
    {
      children: [
        { id: expect.any(String), children: expect.any(Array) },
        { id: expect.any(String) },
      ],
    },
    `
    Object {
      "children": Array [
        Object {
          "children": Any<Array>,
          "id": Any<String>,
          "type": "structured_varname",
        },
        Object {
          "children": Array [
            Object {
              "text": "1 + 1",
            },
          ],
          "id": Any<String>,
          "type": "code_line_v2_code",
        },
      ],
      "id": "id-of-thingy",
      "type": "code_line_v2",
    }
  `
  );

  // It has an inline element instead of an expression
  expect(editor.children[0]).toMatchInlineSnapshot(
    {
      children: [{}, { id: expect.any(String) }, {}],
    },
    `
    Object {
      "children": Array [
        Object {
          "text": "hi ",
        },
        Object {
          "blockId": "id-of-thingy",
          "children": Array [
            Object {
              "text": "",
            },
          ],
          "id": Any<String>,
          "type": "inline-number",
        },
        Object {
          "text": " lol",
        },
      ],
      "type": "p",
    }
  `
  );
});
