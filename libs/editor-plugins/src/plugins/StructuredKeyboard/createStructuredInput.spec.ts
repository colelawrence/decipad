import { Computer } from '@decipad/computer';
import {
  createTPlateEditor,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
} from '@decipad/editor-types';
import { createStructuredKeyboard } from './createStructuredKeyboardPlugin';

const computer = new Computer();

function getStructuredCalc(name: string, value: string, unit?: string) {
  return {
    type: ELEMENT_CODE_LINE_V2,
    unit,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        children: [{ text: name }],
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
        children: [{ text: value }],
      },
    ],
  };
}

describe('Structured input basic keyboard shortcuts', () => {
  const editor = createTPlateEditor({
    plugins: [createStructuredKeyboard(computer)],
  });
  editor.children = [
    getStructuredCalc('a', '100') as never,
    getStructuredCalc('longname', '50') as never,
  ];
  editor.selection = {
    anchor: { path: [0, 0, 0], offset: 1 },
    focus: { path: [0, 0, 0], offset: 1 },
  };
  it('Should move selection to the value when in the name', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    createStructuredKeyboard(
      computer
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
    createStructuredKeyboard(
      computer
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
    createStructuredKeyboard(
      computer
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
    createStructuredKeyboard(
      computer
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
  it('Should move through the structured code lines', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    for (let i = 0; i < 3; i += 1) {
      createStructuredKeyboard(
        computer
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
  it('Should move back through the structured code lines', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    for (let i = 0; i < 3; i += 1) {
      createStructuredKeyboard(
        computer
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
