import { Computer } from '@decipad/computer';
import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  createTPlateEditor,
  ELEMENT_H1,
  CodeLineV2ElementCode,
  ELEMENT_SMART_REF,
} from '@decipad/editor-types';
import { getOnly } from '@decipad/utils';
import { parseStructuredCodeLine } from './CodeLineV2';

const createTestCodeLine = (
  code: string | CodeLineV2ElementCode['children']
) => {
  const codeLine: CodeLineV2Element = {
    type: ELEMENT_CODE_LINE_V2,
    id: 'codelineid',
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: 'test',
        children: [{ text: 'TestName' }],
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
        id: 'test',
        children: typeof code === 'string' ? [{ text: code }] : code,
      },
    ],
  };

  const computer = new Computer();
  const editor = createTPlateEditor();

  editor.children = [
    { id: 'h1', type: ELEMENT_H1, children: [{ text: '' }] },
    codeLine,
  ];

  return { editor, computer, codeLine };
};

it('can parse a number', async () => {
  const { editor, computer, codeLine } = createTestCodeLine('1');
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"literal"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "artificiallyDerivedFrom": undefined,
      "block": Object {
        "args": Array [
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "TestName",
                ],
                "type": "def",
              },
              Object {
                "args": Array [
                  "number",
                  DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                ],
                "type": "literal",
              },
            ],
            "type": "assign",
          },
        ],
        "id": "codelineid",
        "type": "block",
      },
      "definesVariable": "TestName",
      "id": "codelineid",
      "isArtificial": undefined,
      "type": "identified-block",
    }
  `);
});

it('can parse code', async () => {
  const { editor, computer, codeLine } = createTestCodeLine('1 meter');
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"code"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "artificiallyDerivedFrom": undefined,
      "block": Object {
        "args": Array [
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "TestName",
                ],
                "type": "def",
              },
              Object {
                "args": Array [
                  Object {
                    "args": Array [
                      "implicit*",
                    ],
                    "end": Object {
                      "char": 6,
                      "column": 7,
                      "line": 1,
                    },
                    "start": Object {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  Object {
                    "args": Array [
                      Object {
                        "args": Array [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": Object {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      Object {
                        "args": Array [
                          "meter",
                        ],
                        "end": Object {
                          "char": 6,
                          "column": 7,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 2,
                          "column": 3,
                          "line": 1,
                        },
                        "type": "ref",
                      },
                    ],
                    "end": Object {
                      "char": 6,
                      "column": 7,
                      "line": 1,
                    },
                    "start": Object {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": Object {
                  "char": 6,
                  "column": 7,
                  "line": 1,
                },
                "start": Object {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "function-call",
              },
            ],
            "type": "assign",
          },
        ],
        "id": "codelineid",
        "type": "block",
      },
      "definesVariable": "TestName",
      "id": "codelineid",
      "isArtificial": undefined,
      "type": "identified-block",
    }
  `);
});

it('can parse nothing', async () => {
  const { editor, computer, codeLine } = createTestCodeLine(' ');
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"empty"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "artificiallyDerivedFrom": undefined,
      "block": Object {
        "args": Array [
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "TestName",
                ],
                "type": "def",
              },
              Object {
                "args": Array [
                  "number",
                  DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 0n,
                    "s": 1n,
                  },
                ],
                "type": "literal",
              },
            ],
            "type": "assign",
          },
        ],
        "id": "codelineid",
        "type": "block",
      },
      "definesVariable": "TestName",
      "id": "codelineid",
      "isArtificial": undefined,
      "type": "identified-block",
    }
  `);
});

it('regression: deals with smart refs', async () => {
  const { editor, computer, codeLine } = createTestCodeLine([
    { text: '1' },
    { text: ' ' },
    {
      type: ELEMENT_SMART_REF,
      id: '_',
      blockId: '1234',
      columnId: null,
      children: [{ text: '' }],
    },
  ]);
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"code"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "artificiallyDerivedFrom": undefined,
      "block": Object {
        "args": Array [
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "TestName",
                ],
                "type": "def",
              },
              Object {
                "args": Array [
                  Object {
                    "args": Array [
                      "implicit*",
                    ],
                    "end": Object {
                      "char": 13,
                      "column": 14,
                      "line": 1,
                    },
                    "start": Object {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  Object {
                    "args": Array [
                      Object {
                        "args": Array [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": Object {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      Object {
                        "args": Array [
                          "exprRef_1234",
                        ],
                        "end": Object {
                          "char": 13,
                          "column": 14,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 2,
                          "column": 3,
                          "line": 1,
                        },
                        "type": "ref",
                      },
                    ],
                    "end": Object {
                      "char": 13,
                      "column": 14,
                      "line": 1,
                    },
                    "start": Object {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": Object {
                  "char": 13,
                  "column": 14,
                  "line": 1,
                },
                "start": Object {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "function-call",
              },
            ],
            "type": "assign",
          },
        ],
        "id": "codelineid",
        "type": "block",
      },
      "definesVariable": "TestName",
      "id": "codelineid",
      "isArtificial": undefined,
      "type": "identified-block",
    }
  `);
});

it('deals with table+column smart refs', async () => {
  const { editor, computer, codeLine } = createTestCodeLine([
    { text: '1' },
    { text: ' ' },
    {
      type: ELEMENT_SMART_REF,
      id: '_',
      blockId: 'tableId',
      columnId: 'columnId',
      children: [{ text: '' }],
    },
  ]);
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"code"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "artificiallyDerivedFrom": undefined,
      "block": Object {
        "args": Array [
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "TestName",
                ],
                "type": "def",
              },
              Object {
                "args": Array [
                  Object {
                    "args": Array [
                      "implicit*",
                    ],
                    "end": Object {
                      "char": 33,
                      "column": 34,
                      "line": 1,
                    },
                    "start": Object {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  Object {
                    "args": Array [
                      Object {
                        "args": Array [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": Object {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      Object {
                        "args": Array [
                          Object {
                            "args": Array [
                              "exprRef_tableId",
                            ],
                            "end": Object {
                              "char": 16,
                              "column": 17,
                              "line": 1,
                            },
                            "start": Object {
                              "char": 2,
                              "column": 3,
                              "line": 1,
                            },
                            "type": "ref",
                          },
                          Object {
                            "args": Array [
                              "exprRef_columnId",
                            ],
                            "end": Object {
                              "char": 33,
                              "column": 34,
                              "line": 1,
                            },
                            "start": Object {
                              "char": 18,
                              "column": 19,
                              "line": 1,
                            },
                            "type": "colref",
                          },
                        ],
                        "end": Object {
                          "char": 33,
                          "column": 34,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 2,
                          "column": 3,
                          "line": 1,
                        },
                        "type": "property-access",
                      },
                    ],
                    "end": Object {
                      "char": 33,
                      "column": 34,
                      "line": 1,
                    },
                    "start": Object {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": Object {
                  "char": 33,
                  "column": 34,
                  "line": 1,
                },
                "start": Object {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "function-call",
              },
            ],
            "type": "assign",
          },
        ],
        "id": "codelineid",
        "type": "block",
      },
      "definesVariable": "TestName",
      "id": "codelineid",
      "isArtificial": undefined,
      "type": "identified-block",
    }
  `);
});
