import { getRemoteComputer } from '@decipad/remote-computer';
import type { MyEditor } from '@decipad/editor-types';
import { createMyPlateEditor } from '@decipad/editor-types';
import { reset } from '@decipad/feature-flags';
import { createStructuredKeyboard } from './createStructuredKeyboardPlugin';
import { getSmartRef, getStructuredCalc } from './test_utils';
import { timeout } from '@decipad/utils';

describe('Structured input basic keyboard shortcuts', () => {
  let editor: MyEditor;
  const computer = getRemoteComputer();
  beforeEach(() => {
    editor = createMyPlateEditor({
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
  });
  afterEach(() => {
    reset();
  });
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
          "offset": 1,
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
          "offset": 1,
          "path": Array [
            1,
            0,
            0,
          ],
        },
        "focus": Object {
          "offset": 1,
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
          "offset": 1,
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
          "offset": 1,
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

  it('regression: Creates a new structured codeline and moves to its value part', async () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
    });
    createStructuredKeyboard(
      computer
      // @ts-expect-error DOM KeyboardEvent vs React event
    ).handlers?.onKeyDown?.(editor)(event);
    await timeout(100);
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
          "offset": 4,
          "path": Array [
            1,
            1,
            0,
          ],
        },
      }
    `);
  });

  it('regression: Moves to the end of the name, and checks if its too large', () => {
    editor.selection = {
      anchor: { path: [1, 0, 0], offset: 'longname'.length },
      focus: { path: [1, 0, 0], offset: 'longname'.length },
    };
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    createStructuredKeyboard(
      computer
      // @ts-expect-error DOM KeyboardEvent vs React event
    ).handlers?.onKeyDown?.(editor)(event);
    expect(editor.selection).toMatchInlineSnapshot(`
      Object {
        "anchor": Object {
          "offset": 1,
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

describe('Works with smart refs', () => {
  let editor: MyEditor;
  const computer = getRemoteComputer();
  beforeEach(() => {
    editor = createMyPlateEditor({
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
  });
  afterEach(() => {
    reset();
  });

  it('allows smart ref selection', () => {
    const structuredIn = getStructuredCalc('SmartyRefy', '1 +');
    structuredIn.children[1].children.push(getSmartRef(structuredIn.id));
    editor.children.push(structuredIn);

    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    for (let i = 0; i < 5; i += 1) {
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
            2,
            1,
            0,
          ],
        },
        "focus": Object {
          "offset": 0,
          "path": Array [
            2,
            1,
            1,
            0,
          ],
        },
      }
    `);
  });
});
