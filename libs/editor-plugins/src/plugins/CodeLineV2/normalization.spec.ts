import { Computer } from '@decipad/computer';
import {
  CodeLineElement,
  createTPlateEditor,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { createPlugins, normalizeEditor, PlateEditor } from '@udecode/plate';
import {
  createNormalizeCodeLineV2Plugin,
  createNormalizeCodeLineCodePlugin,
  createNormalizeCodeLineVarnamePlugin,
} from './normalization';

jest.mock('nanoid', () => ({ nanoid: () => 'mocked-id' }));

function codeLine(varName?: string, code?: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE_V2,
    children: [
      ...(varName
        ? [
            {
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: varName }],
            },
          ]
        : []),
      ...(code
        ? [
            {
              type: ELEMENT_CODE_LINE_V2_CODE,
              children: [{ text: code }],
            },
          ]
        : []),
    ] as never as CodeLineElement['children'],
  } as never as CodeLineElement;
}

let editor: PlateEditor;
beforeEach(() => {
  const computer = new Computer();
  const plugins = createPlugins([
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
  ]);
  editor = createTPlateEditor({
    plugins,
  }) as never;
});

describe('in a code line', () => {
  describe('when there is multiple children', () => {
    it('should merge all text', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE_V2,
          children: [
            { text: 'code' },
            { type: ELEMENT_PARAGRAPH, children: [{ text: '1' }] },
            { text: '2' },
            { type: ELEMENT_CODE_LINE_V2, children: [{ text: '3' }] },
          ],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });

  describe('missing elements', () => {
    it('adds varname or code when missing', () => {
      editor.children = [
        codeLine('varName', undefined),
        codeLine(undefined, 'code'),
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "varName",
                  },
                ],
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });

  describe('when there is marks', () => {
    it('should remove marks', () => {
      editor.children = [
        {
          type: ELEMENT_CODE_LINE_V2,
          children: [{ text: 'code', bold: true, italic: false }],
        },
      ];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "",
                  },
                ],
                "id": "mocked-id",
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });

  describe('when code line has {b', () => {
    it('should insert "\n  " after {', () => {
      editor.children = [codeLine('a', '{b')];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "a",
                  },
                ],
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "{
          b",
                  },
                ],
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });

  describe('when code line has {}', () => {
    it('should not insert "\n  " after {', () => {
      editor.children = [codeLine('a', '{}')];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "a",
                  },
                ],
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "{}",
                  },
                ],
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });

  describe('when code line has a}', () => {
    it('should insert "\n" before }', () => {
      editor.children = [codeLine('a', '{\nb}')];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "a",
                  },
                ],
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "{
        b
        }",
                  },
                ],
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });

  describe('when code line has tab', () => {
    it('should replace it by double space', () => {
      editor.children = [codeLine('a', '{\n\tb')];

      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "children": Array [
                  Object {
                    "text": "a",
                  },
                ],
                "type": "structured_varname",
              },
              Object {
                "children": Array [
                  Object {
                    "text": "{
          b",
                  },
                ],
                "type": "code_line_v2_code",
              },
            ],
            "type": "code_line_v2",
          },
        ]
      `);
    });
  });
});
