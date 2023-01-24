import { Computer } from '@decipad/computer';
import {
  createTPlateEditor,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import {
  createStructuredInputPlugin,
  onStructuredInputKeyDownPlugin,
} from './createStructuredInput';

function getStructuredIn(name: string, value: string, unit?: string) {
  return {
    id: nanoid(),
    type: ELEMENT_STRUCTURED_IN,
    unit,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_STRUCTURED_VARNAME,
        children: [{ text: name }],
      },
      {
        id: nanoid(),
        type: ELEMENT_STRUCTURED_IN_CHILD,
        children: [{ text: value }],
      },
    ],
  };
}

describe('Structured input basic keyboard shortcuts', () => {
  const computer = new Computer();
  const editor = createTPlateEditor({
    plugins: [createStructuredInputPlugin(computer.getAvailableIdentifier)],
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
      computer.getAvailableIdentifier
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
      computer.getAvailableIdentifier
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
      computer.getAvailableIdentifier
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
      computer.getAvailableIdentifier
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
        computer.getAvailableIdentifier
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
        computer.getAvailableIdentifier
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
