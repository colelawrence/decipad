import {
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate';
import { createTabIndentPlugin } from './createTabIndentPlugin';

const codeLineText = 'codeline = 5 * 2';

const codeLine = (code: string): CodeLineElement => {
  return {
    type: ELEMENT_CODE_LINE,
    id: 'id',
    children: [
      {
        text: code,
      },
    ],
  };
};

describe('Pressing TAB indents inside codelines', () => {
  it('adds a tab to the start of the code line', () => {
    const editor = createPlateEditor();
    editor.children = [codeLine(codeLineText)];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createTabIndentPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([codeLine(`\t${codeLineText}`)]);
  });

  it('adds a tab at the end of the codeline', () => {
    const editor = createPlateEditor();
    editor.children = [codeLine(codeLineText)];
    editor.selection = {
      anchor: { path: [0, 0], offset: codeLineText.length },
      focus: { path: [0, 0], offset: codeLineText.length },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createTabIndentPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([codeLine(`${codeLineText}\t`)]);
  });

  it('adds a tab in the middle of the codeline', () => {
    const middlePosition = Math.floor(codeLineText.length / 2);

    const editor = createPlateEditor();
    editor.children = [codeLine(codeLineText)];
    editor.selection = {
      anchor: { path: [0, 0], offset: middlePosition },
      focus: { path: [0, 0], offset: middlePosition },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createTabIndentPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([
      codeLine(
        `${codeLineText.substring(0, middlePosition)}\t${codeLineText.substring(
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
    const editor = createPlateEditor();
    editor.children = [paragraphElement];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
    });

    // @ts-expect-error DOM KeyboardEvent vs React event
    createTabIndentPlugin().handlers?.onKeyDown(editor)(event);
    expect(editor.children).toMatchObject([paragraphElement]);
  });
});
