// import { Computer } from '@decipad/computer';
import {
  CodeLineElement,
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { createPlugins, normalizeEditor, PlateEditor } from '@udecode/plate';
import { createNormalizeCodeLinePlugin } from './createNormalizeCodeLinePlugin';

function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [{ text: code }],
  } as CodeLineElement;
}

let editor: PlateEditor;
beforeEach(() => {
  // const computer = new Computer();
  const plugins = createPlugins([
    createNormalizeCodeLinePlugin(/* computer */),
  ]);
  editor = createTPlateEditor({
    plugins,
  }) as never;
});

describe('in a code line', () => {
  it('merges all text', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [
          { text: 'code' },
          { type: ELEMENT_PARAGRAPH, children: [{ text: '1' }] },
          { text: '2' },
          { type: ELEMENT_CODE_LINE, children: [{ text: '3' }] },
        ],
      },
    ];

    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([codeLine('code123')]);
  });

  it('does not allow marks', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'code', bold: true, italic: false }],
      },
    ];

    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([codeLine('code')]);
  });
});
