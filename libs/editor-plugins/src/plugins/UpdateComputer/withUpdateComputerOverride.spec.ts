import {
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  MyEditor,
  createTPlateEditor,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { timeout } from '@decipad/utils';
import { insertNodes, removeNodes } from '@udecode/plate';
import { withUpdateComputerOverride } from './withUpdateComputerOverride';

describe('withUpdateComputerOverride', () => {
  let editor: MyEditor;
  let computer: Computer;
  beforeEach(() => {
    const ed = createTPlateEditor();
    ed.children = [
      { type: ELEMENT_H1, children: [{ text: 'title' }], id: 'id1' },
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'first paragraph' }],
        id: 'id2',
      },
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: '_A = 1' }],
        id: 'id3',
      },
    ];
    editor = ed as MyEditor;

    computer = new Computer();
    withUpdateComputerOverride(computer, { debounceEditorChangesMs: 100 })(
      editor
    );
  });

  it('pushes compute on initialization', async () => {
    await timeout(200);
    expect(computer.results.getValue().blockResults).toMatchInlineSnapshot(`
      Object {
        "id3": Object {
          "id": "id3",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber(1),
          },
          "type": "computer-result",
          "usedNames": Array [],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id3",
              "_A",
            },
            "local": Set {},
          },
        },
      }
    `);
  });

  it('allows adding code elements', async () => {
    await timeout(200);
    insertNodes(editor, [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: '_B = 2' }],
        id: 'id4',
      },
    ]);
    insertNodes(editor, [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: '_C = _A + _B' }],
        id: 'id5',
      },
    ]);
    await timeout(200);
    expect(computer.results.getValue().blockResults).toMatchInlineSnapshot(`
      Object {
        "id3": Object {
          "id": "id3",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber(1),
          },
          "type": "computer-result",
          "usedNames": Array [],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id3",
              "_A",
            },
            "local": Set {},
          },
        },
        "id4": Object {
          "id": "id4",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber(2),
          },
          "type": "computer-result",
          "usedNames": Array [],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id3",
              "_A",
              "exprRef_id4",
              "_B",
              "exprRef_id5",
              "_C",
            },
            "local": Set {},
          },
        },
        "id5": Object {
          "id": "id5",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber(3),
          },
          "type": "computer-result",
          "usedNames": Array [
            Array [
              "",
              "_A",
            ],
            Array [
              "",
              "_B",
            ],
          ],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id3",
              "_A",
              "exprRef_id4",
              "_B",
              "exprRef_id5",
              "_C",
            },
            "local": Set {},
          },
        },
      }
    `);
  });

  it('allows removing code elements', async () => {
    await timeout(200);
    insertNodes(editor, [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: '_B = 2' }],
        id: 'id4',
      },
    ]);
    insertNodes(editor, [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: '_C = _A + _B' }],
        id: 'id5',
      },
    ]);
    await timeout(200);
    removeNodes(editor, { at: [2] });
    await timeout(200);
    expect(computer.results.getValue().blockResults).toMatchInlineSnapshot(`
      Object {
        "id4": Object {
          "id": "id4",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber(2),
          },
          "type": "computer-result",
          "usedNames": Array [],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id3",
              "_A",
              "exprRef_id4",
              "_B",
              "exprRef_id5",
              "_C",
            },
            "local": Set {},
          },
        },
        "id5": Object {
          "id": "id5",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": Array [
                Object {
                  "exp": DeciNumber(1),
                  "known": false,
                  "multiplier": DeciNumber(1),
                  "unit": "_A",
                },
              ],
            },
            "value": DeciNumber(3),
          },
          "type": "computer-result",
          "usedNames": Array [
            Array [
              "",
              "_B",
            ],
          ],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id4",
              "_B",
              "exprRef_id5",
              "_C",
            },
            "local": Set {},
          },
        },
      }
    `);
  });
});
