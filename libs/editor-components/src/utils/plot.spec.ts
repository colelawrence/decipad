import { ELEMENT_PLOT, MyEditor } from '@decipad/editor-types';
import { createTEditor } from '@udecode/plate';
import { insertPlotBelow } from './plot';

describe('insertPlotBelow', () => {
  let editor!: MyEditor;
  beforeEach(() => {
    editor = createTEditor() as MyEditor;
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        children: [{ text: '' }],
      } as never,
    ];
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
