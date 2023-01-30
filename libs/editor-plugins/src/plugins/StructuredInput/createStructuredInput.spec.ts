import {
  createTPlateEditor,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { normalizeEditor } from '@udecode/plate';
import {
  createStructuredInputPlugin,
  onStructuredInputKeyDownPlugin,
} from './createStructuredInput';

const getAvailableIdentifier = (prefix: string, start: number) =>
  `${prefix}${start}`;

function getStructuredIn(name: string, value: string, unit?: string) {
  return {
    type: ELEMENT_STRUCTURED_IN,
    unit,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        children: [{ text: name }],
      },
      {
        type: ELEMENT_STRUCTURED_IN_CHILD,
        children: [{ text: value }],
      },
    ],
  };
}

describe('Structured input basic keyboard shortcuts', () => {
  const editor = createTPlateEditor({
    plugins: [createStructuredInputPlugin(getAvailableIdentifier)],
  });
  editor.children = [
    getStructuredIn('a', '100') as never,
    getStructuredIn('longname', '50') as never,
  ];
  editor.selection = {
    anchor: { path: [0, 0, 0], offset: 1 },
    focus: { path: [0, 0, 0], offset: 1 },
  };
  it('Should move selection to the value when in the name', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    onStructuredInputKeyDownPlugin(
      getAvailableIdentifier
      // @ts-expect-error DOM KeyboardEvent vs React event
    ).handlers?.onKeyDown?.(editor)(event);
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            0,
            1,
            0,
          ],
        },
        "focus": Object {
          "offset": 3,
          "path": Array [
            0,
            1,
            0,
          ],
        },
      }
    `);
  });

  it('Should move selection back to the name', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    onStructuredInputKeyDownPlugin(
      getAvailableIdentifier
      // @ts-expect-error DOM KeyboardEvent vs React event
    ).handlers?.onKeyDown?.(editor)(event);
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            0,
            0,
            0,
          ],
        },
        "focus": Object {
          "offset": 1,
          "path": Array [
            0,
            0,
            0,
          ],
        },
      }
    `);
  });

  it('Should move to the name below', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    onStructuredInputKeyDownPlugin(
      getAvailableIdentifier
      // @ts-expect-error DOM KeyboardEvent vs React event
    ).handlers?.onKeyDown?.(editor)(event);
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            1,
            0,
            0,
          ],
        },
        "focus": Object {
          "offset": 0,
          "path": Array [
            1,
            0,
            0,
          ],
        },
      }
    `);
  });

  it('Should move to the name above', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    onStructuredInputKeyDownPlugin(
      getAvailableIdentifier
      // @ts-expect-error DOM KeyboardEvent vs React event
    ).handlers?.onKeyDown?.(editor)(event);
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            0,
            0,
            0,
          ],
        },
        "focus": Object {
          "offset": 0,
          "path": Array [
            0,
            0,
            0,
          ],
        },
      }
    `);
  });
  it('Should move through the structured inputs', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    for (let i = 0; i < 3; i += 1) {
      onStructuredInputKeyDownPlugin(
        getAvailableIdentifier
        // @ts-expect-error DOM KeyboardEvent vs React event
      ).handlers?.onKeyDown?.(editor)(event);
    }
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            1,
            1,
            0,
          ],
        },
        "focus": Object {
          "offset": 2,
          "path": Array [
            1,
            1,
            0,
          ],
        },
      }
    `);
  });
  it('Should move back through the structured inputs', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    for (let i = 0; i < 3; i += 1) {
      onStructuredInputKeyDownPlugin(
        getAvailableIdentifier
        // @ts-expect-error DOM KeyboardEvent vs React event
      ).handlers?.onKeyDown?.(editor)(event);
    }
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            0,
            0,
            0,
          ],
        },
        "focus": Object {
          "offset": 1,
          "path": Array [
            0,
            0,
            0,
          ],
        },
      }
    `);
  });
});

describe('Normalizing structured inputs', () => {
  const editor = createTPlateEditor({
    plugins: [createStructuredInputPlugin(getAvailableIdentifier)],
  });
  editor.children = [
    getStructuredIn('a', '100') as never,
    getStructuredIn('longname', '50') as never,
  ];
  editor.selection = {
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0], offset: 0 },
  };

  it('doesnt do anything if valid', () => {
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
                  "text": "100",
                },
              ],
              "type": "structured_input_child",
            },
          ],
          "type": "structured_input",
          "unit": undefined,
        },
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "longname",
                },
              ],
              "type": "structured_varname",
            },
            Object {
              "children": Array [
                Object {
                  "text": "50",
                },
              ],
              "type": "structured_input_child",
            },
          ],
          "type": "structured_input",
          "unit": undefined,
        },
      ]
    `);
  });

  it('Should remove extra elements', () => {
    editor.children[1].children.push({
      type: ELEMENT_STRUCTURED_IN_CHILD,
      children: [{ text: 'i am an evil extra element' }],
    } as any);
    normalizeEditor(editor, { force: true });
    expect(editor.children[1].children).toHaveLength(2);
  });

  it('Should remove many extra elements', () => {
    for (let i = 0; i < 20; i += 1) {
      editor.children[1].children.push({
        type: ELEMENT_STRUCTURED_IN_CHILD,
        children: [{ text: 'i am an evil extra element' }],
      } as any);
    }
    normalizeEditor(editor, { force: true });
    expect(editor.children[1].children).toHaveLength(2);
  });

  it('adds required elements if they are not present', () => {
    editor.children[1].children = [];
    normalizeEditor(editor, { force: true });
    expect(editor.children[1].children).toHaveLength(2);
  });

  it('doesnt do anything if structured input only has numbers', () => {
    const structuredInput = editor.children[1];
    assertElementType(structuredInput, ELEMENT_STRUCTURED_IN);
    structuredInput.children[1].children[0].text = '123';

    normalizeEditor(editor, { force: true });
    expect(structuredInput.children[1].children[0].text).toBe('123');
  });

  it('removes non numeric characters', () => {
    assertElementType(editor.children[1], ELEMENT_STRUCTURED_IN);
    editor.children[1].children[1].children[0].text = 'iamnota1number2sds';

    normalizeEditor(editor, { force: true });
    expect(editor.children[1].children[1].children[0].text).toBe('12');
  });
});
