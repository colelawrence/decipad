import {
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  MyEditor,
  createTPlateEditor,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { timeout } from '@decipad/utils';
import { insertNodes, removeNodes, setNodes } from '@udecode/plate';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { withUpdateComputerOverride } from './withUpdateComputerOverride';

setupDeciNumberSnapshotSerializer();

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
          "epoch": 1n,
          "id": "id3",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
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
          "epoch": 1n,
          "id": "id3",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
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
          "epoch": 2n,
          "id": "id4",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
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
          "epoch": 2n,
          "id": "id5",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
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
          "epoch": 2n,
          "id": "id4",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
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
          "epoch": 3n,
          "id": "id5",
          "result": Object {
            "type": Object {
              "errorCause": Object {
                "context": "in operation \\"+\\" (type-error, number)",
                "errType": "unknown-reference",
                "refName": "_A",
              },
              "errorLocation": Object {
                "end": Object {
                  "char": 6,
                  "column": 7,
                  "line": 1,
                },
                "start": Object {
                  "char": 5,
                  "column": 6,
                  "line": 1,
                },
              },
              "kind": "type-error",
            },
            "value": Symbol(unknown),
          },
          "type": "computer-result",
          "usedNames": Array [],
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

  it('allows changing ids of code elements', async () => {
    await timeout(200);
    setNodes(editor, { id: 'id3-new' }, { at: [2] });
    await timeout(200);
    expect(computer.results.getValue().blockResults).toMatchInlineSnapshot(`
      Object {
        "id3": Object {
          "epoch": 1n,
          "id": "id3",
          "result": Object {
            "type": Object {
              "kind": "number",
              "unit": null,
            },
            "value": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
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
        "id3-new": Object {
          "epoch": 2n,
          "id": "id3-new",
          "result": Object {
            "type": Object {
              "errorCause": Object {
                "duplicatedName": "_A",
                "errType": "duplicated-name",
              },
              "errorLocation": undefined,
              "kind": "type-error",
            },
            "value": Symbol(unknown),
          },
          "type": "computer-result",
          "usedNames": Array [],
          "visibleVariables": Object {
            "global": Set {
              "exprRef_id3",
              "_A",
              "exprRef_id3_new",
            },
            "local": Set {},
          },
        },
      }
    `);
  });
});
