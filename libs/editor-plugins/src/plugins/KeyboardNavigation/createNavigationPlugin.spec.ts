import {
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  ELEMENT_TR,
  ELEMENT_TD,
  TableElement,
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  createTPlateEditor,
} from '@decipad/editor-types';
import { TEditor } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { createNavigationPlugin } from './createNavigationPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNavigationPlugin()],
  });
});

const codeLineText = 'codeline = 5 * 2';

const codeLine = (code: string): CodeLineElement => ({
  type: ELEMENT_CODE_LINE,
  id: 'id',
  children: [
    {
      text: code,
    },
  ],
});

const tableCells = (): TableElement => ({
  type: ELEMENT_TABLE,
  id: nanoid(),
  children: [
    {
      id: nanoid(),
      type: ELEMENT_TABLE_CAPTION,
      children: [
        {
          id: nanoid(),
          type: ELEMENT_TABLE_VARIABLE_NAME,
          children: [{ text: '' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      id: nanoid(),
      children: [
        {
          type: ELEMENT_TH,
          id: nanoid(),
          cellType: {
            kind: 'number',
            unit: null,
          },
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_TH,
          id: nanoid(),
          cellType: {
            kind: 'number',
            unit: null,
          },
          children: [{ text: '' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      id: nanoid(),
      children: [
        {
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: '' }],
        },
        {
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: '' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      id: nanoid(),
      children: [
        {
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: '' }],
        },
        {
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: '' }],
        },
      ],
    },
  ],
});

const SPACES = '  ';

describe('Pressing TAB indents inside codelines', () => {
  it('adds a tab to the start of the code line', () => {
    editor.children = [codeLine(codeLineText)];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([
      codeLine(`${SPACES}${codeLineText}`),
    ]);
  });

  it('adds a tab at the end of the codeline', () => {
    editor.children = [codeLine(codeLineText)];
    editor.selection = {
      anchor: { path: [0, 0], offset: codeLineText.length },
      focus: { path: [0, 0], offset: codeLineText.length },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([
      codeLine(`${codeLineText}${SPACES}`),
    ]);
  });

  it('adds a tab in the middle of the codeline', () => {
    const middlePosition = Math.floor(codeLineText.length / 2);

    editor.children = [codeLine(codeLineText)];
    editor.selection = {
      anchor: { path: [0, 0], offset: middlePosition },
      focus: { path: [0, 0], offset: middlePosition },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([
      codeLine(
        `${codeLineText.substring(
          0,
          middlePosition
        )}${SPACES}${codeLineText.substring(
          middlePosition,
          codeLineText.length
        )}`
      ),
    ]);
  });
});

describe('tabs should not be added to non codelines', () => {
  const paragraphElement = {
    type: ELEMENT_PARAGRAPH,
    id: 'id',
    children: [
      {
        text: codeLineText,
      },
    ],
  };

  it('shouldnt add tabs to paragraph elements', () => {
    editor.children = [paragraphElement];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([paragraphElement]);
  });
});

describe('pressing enter on tables', () => {
  it('should move to the next row', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 2, 0, 0], offset: 0 },
      focus: { path: [0, 2, 0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 3, 0, 0]);
  });
  it('should move to the top of the right column when there is no cell below', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 3, 0, 0], offset: 0 },
      focus: { path: [0, 3, 0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 2, 1, 0]);
  });
  it('should not move if at the bottom right (last) cell', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 3, 1, 0], offset: 0 },
      focus: { path: [0, 3, 1, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 3, 1, 0]);
  });
});

describe('pressing tab on tables', () => {
  it('moves to the cell on the right', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 2, 0, 0], offset: 0 },
      focus: { path: [0, 2, 0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 2, 1, 0]);
  });
  it('should move backwards when shift is also pressed', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 2, 1, 0], offset: 0 },
      focus: { path: [0, 2, 1, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 2, 0, 0]);
  });
  it('moves to the first cell of the next row when at the last cell of the above row', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 2, 1, 0], offset: 0 },
      focus: { path: [0, 2, 1, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 3, 0, 0]);
  });
  it('should not move if at the bottom right (last) cell', () => {
    editor.children = [tableCells()];
    editor.selection = {
      anchor: { path: [0, 3, 1, 0], offset: 0 },
      focus: { path: [0, 3, 1, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createNavigationPlugin().handlers?.onKeyDown(editor)(event);

    expect(editor.selection.anchor.path).toMatchObject([0, 3, 1, 0]);
  });
});
