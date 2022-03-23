import { Element, ELEMENT_PLOT } from '@decipad/editor-types';
import { Editor, createEditor } from 'slate';
import { insertPlotBelow } from './plot';

describe('insertPlotBelow', () => {
  let editor!: Editor;
  beforeEach(() => {
    editor = createEditor();
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        children: [{ text: '' }],
      },
    ] as Element[];
  });

  it('inserts a plot element below given block path', () => {
    insertPlotBelow(editor, [0]);
    expect(editor).toHaveProperty('children.1.type', ELEMENT_PLOT);
  });

  it('inserts a plot element below the block containing given non-block path', () => {
    insertPlotBelow(editor, [0, 0]);
    expect(editor).toHaveProperty('children.1.type', ELEMENT_PLOT);
  });
});
