import {
  createTPlateEditor,
  DECORATE_POTENTIAL_FORMULA,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { TEditor } from '@udecode/plate';
import { noop } from 'lodash';
import { commitPotentialFormula } from './PotentialFormulaHighlight';
import { createInlineNumberPlugin } from '../../MagicNumber/createInlineNumberPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createInlineNumberPlugin()],
  });
});

it.skip('turns a decoration into a magic number and a code line', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hi 1 + 1 lol' }],
    },
  ];

  commitPotentialFormula(
    editor as any,
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
  expect(editor.children[1]).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "text": "1 + 1",
        },
      ],
      "id": "id-of-thingy",
      "type": "code_line",
    }
  `);

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
