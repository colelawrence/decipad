import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { createCodeLinePlugin } from './createCodeLinePlugin';

describe('withCodeLine', () => {
  let editor: MyEditor;
  beforeEach(() => {
    editor = createTPlateEditor({
      plugins: [createCodeLinePlugin()],
    });
  });

  describe('when inserting new line', () => {
    it('should insert insert 2 spaces and another new line, then move selection just after the 2 spaces', () => {
      editor.children = [
        {
          id: '1',
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'a = {}',
            },
          ],
        },
      ] as never;
      editor.selection = {
        anchor: {
          offset: 5,
          path: [0, 0],
        },
        focus: {
          offset: 5,
          path: [0, 0],
        },
      };

      editor.insertText('\n');

      expect(editor.children).toEqual([
        {
          id: '1',
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: 'a = {\n  \n}',
            },
          ],
        },
      ]);
      expect(editor.selection).toEqual({
        anchor: {
          offset: 8,
          path: [0, 0],
        },
        focus: {
          offset: 8,
          path: [0, 0],
        },
      });
    });
  });
});
