import { expect, it } from 'vitest';
import { getComputer } from '@decipad/computer';
import type {
  CodeLineV2Element,
  CodeLineV2ElementCode,
} from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_SMART_REF,
  ELEMENT_TITLE,
  ELEMENT_TAB,
  ELEMENT_DATA_TAB,
} from '@decipad/editor-types';
import { getOnly } from '@decipad/utils';
import { parseStructuredCodeLine } from './CodeLineV2';
import { createTestEditorController } from '../testEditorController';

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

  const computer = getComputer();
  const editor = createTestEditorController('id');

  editor.children = [
    { id: 'title', type: ELEMENT_TITLE, children: [{ text: '' }] },
    { id: 'data-tab', type: ELEMENT_DATA_TAB, children: [] },
    { id: 'tab1', type: ELEMENT_TAB, name: 'First tab', children: [codeLine] },
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
    {
      "artificiallyDerivedFrom": undefined,
      "block": {
        "args": [
          {
            "args": [
              {
                "args": [
                  "TestName",
                ],
                "type": "def",
              },
              {
                "args": [
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
    {
      "artificiallyDerivedFrom": undefined,
      "block": {
        "args": [
          {
            "args": [
              {
                "args": [
                  "TestName",
                ],
                "type": "def",
              },
              {
                "args": [
                  {
                    "args": [
                      "implicit*",
                    ],
                    "end": {
                      "char": 6,
                      "column": 7,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  {
                    "args": [
                      {
                        "args": [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      {
                        "args": [
                          "meter",
                        ],
                        "end": {
                          "char": 6,
                          "column": 7,
                          "line": 1,
                        },
                        "start": {
                          "char": 2,
                          "column": 3,
                          "line": 1,
                        },
                        "type": "ref",
                      },
                    ],
                    "end": {
                      "char": 6,
                      "column": 7,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": {
                  "char": 6,
                  "column": 7,
                  "line": 1,
                },
                "start": {
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
    {
      "artificiallyDerivedFrom": undefined,
      "block": {
        "args": [
          {
            "args": [
              {
                "args": [
                  "TestName",
                ],
                "type": "def",
              },
              {
                "args": [
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
    {
      "artificiallyDerivedFrom": undefined,
      "block": {
        "args": [
          {
            "args": [
              {
                "args": [
                  "TestName",
                ],
                "type": "def",
              },
              {
                "args": [
                  {
                    "args": [
                      "implicit*",
                    ],
                    "end": {
                      "char": 13,
                      "column": 14,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  {
                    "args": [
                      {
                        "args": [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      {
                        "args": [
                          "exprRef_1234",
                        ],
                        "end": {
                          "char": 13,
                          "column": 14,
                          "line": 1,
                        },
                        "start": {
                          "char": 2,
                          "column": 3,
                          "line": 1,
                        },
                        "type": "ref",
                      },
                    ],
                    "end": {
                      "char": 13,
                      "column": 14,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": {
                  "char": 13,
                  "column": 14,
                  "line": 1,
                },
                "start": {
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
    {
      "artificiallyDerivedFrom": undefined,
      "block": {
        "args": [
          {
            "args": [
              {
                "args": [
                  "TestName",
                ],
                "type": "def",
              },
              {
                "args": [
                  {
                    "args": [
                      "implicit*",
                    ],
                    "end": {
                      "char": 33,
                      "column": 34,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  {
                    "args": [
                      {
                        "args": [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      {
                        "args": [
                          {
                            "args": [
                              "exprRef_tableId",
                            ],
                            "end": {
                              "char": 16,
                              "column": 17,
                              "line": 1,
                            },
                            "start": {
                              "char": 2,
                              "column": 3,
                              "line": 1,
                            },
                            "type": "ref",
                          },
                          {
                            "args": [
                              "exprRef_columnId",
                            ],
                            "end": {
                              "char": 33,
                              "column": 34,
                              "line": 1,
                            },
                            "start": {
                              "char": 18,
                              "column": 19,
                              "line": 1,
                            },
                            "type": "colref",
                          },
                        ],
                        "end": {
                          "char": 33,
                          "column": 34,
                          "line": 1,
                        },
                        "start": {
                          "char": 2,
                          "column": 3,
                          "line": 1,
                        },
                        "type": "property-access",
                      },
                    ],
                    "end": {
                      "char": 33,
                      "column": 34,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": {
                  "char": 33,
                  "column": 34,
                  "line": 1,
                },
                "start": {
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
