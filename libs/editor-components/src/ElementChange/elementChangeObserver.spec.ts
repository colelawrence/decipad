import {
  CodeLineV2Element,
  DropdownElement,
  ELEMENT_CAPTION,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DROPDOWN,
  ELEMENT_H1,
  ELEMENT_SMART_REF,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_VARIABLE_DEF,
  EditorObserverMessage,
  ParagraphElement,
  SmartRefElement,
  VariableDropdownElement,
  createTPlateEditor,
} from '@decipad/editor-types';
import {
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
  insertNodes,
  moveNodes,
  removeNodes,
  setNodes,
} from '@udecode/plate';
import { setSelection } from '@decipad/editor-utils';
import {
  ElementObserverFactory,
  elementChangeFunction,
} from './elementChangeObservable';

describe('observes changes in specific elements', () => {
  let editor = createTPlateEditor();
  editor.children = [{ type: ELEMENT_H1, id: '1', children: [{ text: '' }] }];
  editor = elementChangeFunction(editor);

  /**
   * We can test it this way because the editor.apply will run synchronously,
   * therefore any observer calls are done prior to `insertText` moving on.
   */
  it('listens to changes on H1 element', () => {
    const items: EditorObserverMessage[] = [];

    const $ = ElementObserverFactory(editor, ELEMENT_H1);

    $?.subscribe((v) => items.push(v));

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    editor.insertText('hello');

    expect(items).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "text": "hello",
              },
            ],
            "id": "1",
            "type": "h1",
          },
          "opType": "insert_text",
        },
      ]
    `);
  });

  it('listens to various changes on H1 element', () => {
    const items: EditorObserverMessage[] = [];

    const $ = ElementObserverFactory(editor, ELEMENT_H1);
    $?.subscribe((v) => items.push(v));

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 'hello'.length,
      },
      focus: {
        path: [0, 0],
        offset: 'hello'.length,
      },
    };

    editor.deleteBackward('character');
    expect(items[0]).toMatchInlineSnapshot(`
      Object {
        "element": Object {
          "children": Array [
            Object {
              "text": "hell",
            },
          ],
          "id": "1",
          "type": "h1",
        },
        "opType": "remove_text",
      }
    `);

    editor.deleteBackward('character');
    expect(items[1]).toMatchInlineSnapshot(`
      Object {
        "element": Object {
          "children": Array [
            Object {
              "text": "hel",
            },
          ],
          "id": "1",
          "type": "h1",
        },
        "opType": "remove_text",
      }
    `);

    editor.insertText('b');
    expect(items[2]).toMatchInlineSnapshot(`
      Object {
        "element": Object {
          "children": Array [
            Object {
              "text": "helb",
            },
          ],
          "id": "1",
          "type": "h1",
        },
        "opType": "insert_text",
      }
    `);
  });

  it('Reuses observable objects from pool', () => {
    const $1 = ElementObserverFactory(editor, ELEMENT_H1);
    const $2 = ElementObserverFactory(editor, ELEMENT_H1);

    expect($1).toBeDefined();
    expect($2).toBeDefined();
    expect($1).toBe($2);
  });

  it('Can listen to different parts of object', () => {
    editor.children = [
      ...editor.children,
      {
        type: ELEMENT_CODE_LINE_V2,
        id: '2',
        children: [
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            id: '3',
            children: [{ text: 'Varname' }],
          },
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            id: '4',
            children: [{ text: '1 + 1' }],
          },
        ],
      } satisfies CodeLineV2Element,
    ];

    editor.selection = {
      anchor: {
        path: [1, 0, 0],
        offset: 'Varname'.length,
      },
      focus: {
        path: [1, 0, 0],
        offset: 'Varname'.length,
      },
    };

    const codelineItems: EditorObserverMessage[] = [];
    const varnameItems: EditorObserverMessage[] = [];

    const codeline$ = ElementObserverFactory(editor, ELEMENT_CODE_LINE_V2);
    const varname$ = ElementObserverFactory(editor, ELEMENT_STRUCTURED_VARNAME);

    codeline$?.subscribe((v) => codelineItems.push(v));
    varname$?.subscribe((v) => varnameItems.push(v));

    editor.insertText('e');

    expect(codelineItems).toHaveLength(varnameItems.length);
    expect(codelineItems).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Varnamee",
                  },
                ],
                "id": "3",
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "1 + 1",
                  },
                ],
                "id": "4",
                "type": "code_line_v2_code",
              },
            ],
            "id": "2",
            "type": "code_line_v2",
          },
          "opType": "insert_text",
        },
      ]
    `);
    expect(varnameItems).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "text": "Varnamee",
              },
            ],
            "id": "3",
            "type": "structured_varname",
          },
          "opType": "insert_text",
        },
      ]
    `);

    editor.selection = {
      anchor: {
        path: [1, 1, 0],
        offset: '1 + 1'.length,
      },
      focus: {
        path: [1, 1, 0],
        offset: '1 + 1'.length,
      },
    };

    editor.insertText(' ');

    expect(codelineItems).toHaveLength(2);
    expect(varnameItems).toHaveLength(1);
  });

  it('should listen on set_node operations', () => {
    editor.children = [
      ...editor.children,
      {
        id: '5',
        type: ELEMENT_VARIABLE_DEF,
        variant: 'dropdown',
        children: [
          {
            id: '6',
            type: ELEMENT_CAPTION,
            children: [{ text: 'Name' }],
            icon: 'some',
            color: 'color',
          },
          {
            id: '7',
            type: ELEMENT_DROPDOWN,
            options: [{ id: 'dropdown-1', value: '12' }],
            children: [{ text: '' }],
          },
        ],
      } satisfies VariableDropdownElement,
    ];

    const changes: EditorObserverMessage[] = [];
    const dropdown$ = ElementObserverFactory(editor, ELEMENT_DROPDOWN);

    dropdown$?.subscribe((v) => changes.push(v));

    setNodes(
      editor,
      {
        options: [{ id: 'dropdown-2', value: '13' }],
      } satisfies Partial<DropdownElement>,
      { at: [editor.children.length - 1, 1] }
    );

    expect(changes).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "text": "",
              },
            ],
            "id": "7",
            "options": Array [
              Object {
                "id": "dropdown-2",
                "value": "13",
              },
            ],
            "type": "dropdown",
          },
          "opType": "set_node",
        },
      ]
    `);
  });

  it('gets notified of element deletion', () => {
    const changes: EditorObserverMessage[] = [];
    const varDef$ = ElementObserverFactory(editor, ELEMENT_VARIABLE_DEF);

    varDef$?.subscribe((v) => changes.push(v));

    removeNodes(editor, {
      at: [editor.children.length - 1],
    });

    expect(changes).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Name",
                  },
                ],
                "color": "color",
                "icon": "some",
                "id": "6",
                "type": "caption",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "7",
                "options": Array [
                  Object {
                    "id": "dropdown-2",
                    "value": "13",
                  },
                ],
                "type": "dropdown",
              },
            ],
            "id": "5",
            "type": "def",
            "variant": "dropdown",
          },
          "opType": "remove_node",
        },
      ]
    `);
  });

  it('doesnt get updated on selection changes', () => {
    const changes: EditorObserverMessage[] = [];
    const varDef$ = ElementObserverFactory(editor, ELEMENT_VARIABLE_DEF);

    const varDef = varDef$?.subscribe((v) => changes.push(v));

    // Let's set the selection to the H1;

    setSelection(editor, {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    });

    expect(changes).toHaveLength(0);

    // And now on the variable def

    setSelection(editor, {
      anchor: {
        path: [editor.children.length - 1, 0, 0],
        offset: 0,
      },
      focus: {
        path: [editor.children.length - 1, 0, 0],
        offset: 0,
      },
    });

    expect(changes).toHaveLength(0);

    varDef?.unsubscribe();
  });
});

describe('Listens to change on specific IDs', () => {
  let editor = createTPlateEditor();
  editor.children = [{ type: ELEMENT_H1, id: '1', children: [{ text: '' }] }];
  editor = elementChangeFunction(editor);

  it('Listens to changes on id: 1', () => {
    const changes: EditorObserverMessage[] = [];
    const id1$ = ElementObserverFactory(editor, ELEMENT_H1, '1');

    const id1 = id1$?.subscribe((v) => changes.push(v));

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    editor.insertText('Hello');

    expect(changes).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "text": "Hello",
              },
            ],
            "id": "1",
            "type": "h1",
          },
          "opType": "insert_text",
        },
      ]
    `);

    id1?.unsubscribe();
  });

  it('Only listens to change for the specific element', () => {
    editor.children = [
      ...editor.children,
      { type: ELEMENT_H1, id: 'another_h1', children: [{ text: '' }] },
    ];

    const changes: EditorObserverMessage[] = [];
    const id1$ = ElementObserverFactory(editor, ELEMENT_H1, '1');

    const id1 = id1$?.subscribe((v) => changes.push(v));

    editor.selection = {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    };

    editor.insertText('a');

    // 1 change to the 1st h1 element.
    expect(changes).toHaveLength(1);

    editor.selection = {
      anchor: {
        path: [1, 0],
        offset: 0,
      },
      focus: {
        path: [1, 0],
        offset: 0,
      },
    };

    editor.insertText('a');

    // Same as before, because we don't listen to changes on other elements of same type.
    expect(changes).toHaveLength(1);

    id1?.unsubscribe();
  });

  it('Doesnt listen to random ID changes', () => {
    const changes: EditorObserverMessage[] = [];
    const id1$ = ElementObserverFactory(editor, ELEMENT_H1, 'random_id');

    const id1 = id1$?.subscribe((v) => changes.push(v));

    editor.insertText('hello_world');

    expect(changes).toHaveLength(0);

    id1?.unsubscribe();
  });

  it('Listens to ID change on parent when child changes', () => {
    const changes: EditorObserverMessage[] = [];
    const id2$ = ElementObserverFactory(editor, ELEMENT_CODE_LINE_V2, '2');

    const id2 = id2$?.subscribe((v) => changes.push(v));

    editor.children = [
      ...editor.children,
      {
        type: ELEMENT_CODE_LINE_V2,
        id: '2',
        children: [
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            id: '3',
            children: [{ text: 'Varname' }],
          },
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            id: '4',
            children: [{ text: '1 + 1' }],
          },
        ],
      },
    ];

    editor.selection = {
      anchor: {
        path: [editor.children.length - 1, 0, 0],
        offset: 'Varname'.length,
      },
      focus: {
        path: [editor.children.length - 1, 0, 0],
        offset: 'Varname'.length,
      },
    };

    editor.insertText('e');

    expect(changes).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Varnamee",
                  },
                ],
                "id": "3",
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "1 + 1",
                  },
                ],
                "id": "4",
                "type": "code_line_v2_code",
              },
            ],
            "id": "2",
            "type": "code_line_v2",
          },
          "opType": "insert_text",
        },
      ]
    `);

    id2?.unsubscribe();
  });

  it('Doesnt listen to random ID', () => {
    const changes: EditorObserverMessage[] = [];
    const random$ = ElementObserverFactory(
      editor,
      ELEMENT_CODE_LINE_V2,
      'random_id'
    );

    random$?.subscribe((v) => changes.push(v));

    editor.insertText('a');

    expect(changes).toHaveLength(0);
  });

  it('Doesnt listen to changes if type and id dont match a specific element', () => {
    const changes: EditorObserverMessage[] = [];
    const nonMatch$ = ElementObserverFactory(editor, ELEMENT_H1, '2');

    const nonMatch = nonMatch$?.subscribe((v) => changes.push(v));

    editor.insertText('a');

    expect(changes).toHaveLength(0);

    nonMatch?.unsubscribe();
  });

  it('Listens to deletion on id', () => {
    const changes: EditorObserverMessage[] = [];
    const id2$ = ElementObserverFactory(editor, ELEMENT_CODE_LINE_V2, '2');

    const id2 = id2$?.subscribe((v) => changes.push(v));

    removeNodes(editor, {
      at: [editor.children.length - 1],
    });

    expect(changes).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "Varnameeaa",
                  },
                ],
                "id": "3",
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "1 + 1",
                  },
                ],
                "id": "4",
                "type": "code_line_v2_code",
              },
            ],
            "id": "2",
            "type": "code_line_v2",
          },
          "opType": "remove_node",
        },
      ]
    `);

    id2?.unsubscribe();
  });

  it('Listens to insertions in the children', () => {
    const changes: EditorObserverMessage[] = [];
    const id4$ = ElementObserverFactory(editor, ELEMENT_CODE_LINE_V2_CODE, '4');

    const id4 = id4$?.subscribe((v) => changes.push(v));

    editor.children = [
      ...editor.children,
      {
        type: ELEMENT_CODE_LINE_V2,
        id: '2',
        children: [
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            id: '3',
            children: [{ text: 'Varname' }],
          },
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            id: '4',
            children: [{ text: '1 + 1' }],
          },
        ],
      },
    ];

    insertNodes(
      editor,
      {
        type: ELEMENT_SMART_REF,
        blockId: 'some_id',
        columnId: null,
        id: 'smart_ref_1',
        children: [{ text: '' }],
      } satisfies SmartRefElement,
      {
        at: [editor.children.length - 1, 1, 1],
      }
    );

    id4?.unsubscribe();

    expect(changes).toMatchInlineSnapshot(`
      Array [
        Object {
          "element": Object {
            "children": Array [
              Object {
                "text": "1 + 1",
              },
              Object {
                "blockId": "some_id",
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "columnId": null,
                "id": "smart_ref_1",
                "type": "smart-ref",
              },
            ],
            "id": "4",
            "type": "code_line_v2_code",
          },
          "opType": "insert_node",
        },
        Object {
          "element": Object {
            "children": Array [
              Object {
                "text": "1 + 1",
              },
            ],
            "id": "4",
            "type": "code_line_v2_code",
          },
          "opType": "remove_node",
        },
      ]
    `);
  });
});

describe('Doesnt care about paths', () => {
  let editor = createTPlateEditor();
  editor.children = [
    { type: ELEMENT_H1, id: '1', children: [{ text: '' }] },
    {
      type: ELEMENT_PARAGRAPH,
      id: 'p1',
      children: [{ text: 'sometext' }],
    } satisfies ParagraphElement,
    {
      type: ELEMENT_PARAGRAPH,
      id: 'p2',
      children: [{ text: 'some other text' }],
    } satisfies ParagraphElement,
  ];
  editor = elementChangeFunction(editor);

  it('listens to element even if its path changes', () => {
    const changes: EditorObserverMessage[] = [];
    const p1$ = ElementObserverFactory(editor, ELEMENT_PARAGRAPH, 'p1');

    p1$?.subscribe((v) => changes.push(v));

    editor.selection = {
      anchor: {
        path: [1, 0],
        offset: 'sometext'.length,
      },
      focus: {
        path: [1, 0],
        offset: 'sometext'.length,
      },
    };

    editor.insertText('a');

    expect(changes).toHaveLength(1);

    // Now let's move the node.
    moveNodes(editor, {
      at: [1],
      to: [2],
    });

    // Because the selection was on the node we modes, we need to reset it to the first element.
    // Otherwise the selection follows the node.
    editor.selection = {
      anchor: {
        path: [1, 0],
        offset: 'sometext'.length,
      },
      focus: {
        path: [1, 0],
        offset: 'sometext'.length,
      },
    };

    // But now inserting text means inserting into the other paragraph.
    editor.insertText('a');

    expect(changes).toHaveLength(1);
  });

  it('doesnt listen when a parent node changes', () => {
    const changes: EditorObserverMessage[] = [];
    const varname3$ = ElementObserverFactory(
      editor,
      ELEMENT_STRUCTURED_VARNAME,
      '3'
    );

    varname3$?.subscribe((v) => changes.push(v));

    editor.children = [
      ...editor.children,
      {
        type: ELEMENT_CODE_LINE_V2,
        id: '2',
        children: [
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            id: '3',
            children: [{ text: 'Varname' }],
          },
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            id: '4',
            children: [{ text: '1 + 1' }],
          },
        ],
      },
    ];

    setNodes(
      editor,
      {
        someProperty: 'hello',
      },
      { at: [editor.children.length - 1] }
    );

    expect(changes).toHaveLength(0);
  });

  it('doesnt listen when a subling node changes', () => {
    const changes: EditorObserverMessage[] = [];
    const varname3$ = ElementObserverFactory(
      editor,
      ELEMENT_STRUCTURED_VARNAME,
      '3'
    );

    varname3$?.subscribe((v) => changes.push(v));

    setNodes(
      editor,
      {
        someProperty: 'hello',
      },
      { at: [editor.children.length - 1, 1] }
    );

    expect(changes).toHaveLength(0);
  });
});

describe('Observer clean up', () => {
  let editor = createTPlateEditor();
  editor.children = [{ type: ELEMENT_H1, id: '1', children: [{ text: '' }] }];
  editor = elementChangeFunction(editor);

  it('cleans up editor observer pool when unsubscribed', () => {
    const test = ElementObserverFactory(editor, ELEMENT_H1);

    const test$ = test?.subscribe(() => {});

    expect(editor.elementObserverPool?.size).toBe(1);

    test$?.unsubscribe();

    expect(editor.elementObserverPool?.size).toBe(0);
  });

  it('doesnt remove subscriber is another subscription is active', () => {
    const test = ElementObserverFactory(editor, ELEMENT_H1);

    const test1$ = test?.subscribe(() => {});
    const test2$ = test?.subscribe(() => {});

    expect(editor.elementObserverPool?.size).toBe(1);

    test1$?.unsubscribe();
    expect(editor.elementObserverPool?.size).toBe(1);

    test2$?.unsubscribe();
    expect(editor.elementObserverPool?.size).toBe(0);
  });

  it('works same with specific element ids', () => {
    const test = ElementObserverFactory(editor, ELEMENT_H1, '1');

    const test1$ = test?.subscribe(() => {});
    const test2$ = test?.subscribe(() => {});

    expect(editor.specificElementObserverPool?.size).toBe(1);

    test1$?.unsubscribe();
    expect(editor.specificElementObserverPool?.size).toBe(1);

    test2$?.unsubscribe();
    expect(editor.specificElementObserverPool?.size).toBe(0);
  });

  it('works with various subscriptions', () => {
    const h1Observable = ElementObserverFactory(editor, ELEMENT_H1, '1');
    const h2Observable = ElementObserverFactory(editor, ELEMENT_H2, '2');

    const h1Observable1$ = h1Observable?.subscribe(() => {});
    const h1Observable2$ = h1Observable?.subscribe(() => {});

    const h2Observable1$ = h2Observable?.subscribe(() => {});
    const h2Observable2$ = h2Observable?.subscribe(() => {});

    expect(editor.specificElementObserverPool?.size).toBe(2);

    // Size of 2 because even though this unsubscribed, other subscriptions are
    // active

    h1Observable1$?.unsubscribe();
    expect(editor.specificElementObserverPool?.size).toBe(2);

    h2Observable1$?.unsubscribe();
    expect(editor.specificElementObserverPool?.size).toBe(2);

    h1Observable2$?.unsubscribe();
    expect(editor.specificElementObserverPool?.size).toBe(1);

    h2Observable2$?.unsubscribe();
    expect(editor.specificElementObserverPool?.size).toBe(0);
  });
});
