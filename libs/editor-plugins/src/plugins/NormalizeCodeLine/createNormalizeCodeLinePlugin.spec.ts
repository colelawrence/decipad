import {
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import {
  createPlateEditor,
  createPlugins,
  PlateEditor,
  TDescendant,
} from '@udecode/plate';
import { Editor } from 'slate';
import { createNormalizeCodeLinePlugin } from './createNormalizeCodeLinePlugin';

function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: code,
      },
    ],
  } as CodeLineElement;
}

let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins([createNormalizeCodeLinePlugin()]);
  editor = createPlateEditor({
    plugins,
  });
});

describe('in a code line', () => {
  it('merges all text', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [
          {
            type: ELEMENT_CODE_LINE,
            children: [
              { text: 'code' },
              { type: ELEMENT_PARAGRAPH, children: [{ text: '1' }] },
              { text: '2' },
              { type: ELEMENT_CODE_LINE, children: [{ text: '3' }] },
            ],
          },
        ],
      },
    ] as TDescendant[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_BLOCK, children: [codeLine('code123')] },
    ]);
  });

  it('does not allow marks', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [
          {
            type: ELEMENT_CODE_LINE,
            children: [{ text: 'code', bold: true, italic: false }],
          },
        ],
      },
    ] as TDescendant[];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type: ELEMENT_CODE_BLOCK, children: [codeLine('code')] },
    ]);
  });
});
