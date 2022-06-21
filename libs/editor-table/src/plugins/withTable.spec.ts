import {
  createNodeIdPlugin,
  createPlateEditor,
  PlatePlugin,
  TEditor,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Computer } from '@decipad/computer';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { createTablePlugin } from './createTablePlugin';

describe('withTable', () => {
  let editor: TEditor;

  beforeEach(() => {
    editor = createPlateEditor({
      plugins: [
        createNodeIdPlugin({ options: { idCreator: nanoid } }),
        createTablePlugin(new Computer()) as PlatePlugin,
      ],
    });
  });

  describe('when inserting a table without caption', () => {
    it('should add a caption', () => {
      editor.children = [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '' }],
        },
      ] as never;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      editor.insertFragment([
        {
          id: '1',
          type: ELEMENT_TABLE,
          children: [
            {
              id: '1',
              type: ELEMENT_TR,
              children: [
                {
                  id: '1',
                  type: ELEMENT_TH,
                  children: [{ text: '' }],
                  cellType: {
                    kind: 'string',
                  },
                },
              ],
            },
            {
              id: '1',
              type: ELEMENT_TR,
              children: [
                {
                  id: '1',
                  type: ELEMENT_TD,
                  children: [{ text: '' }],
                },
              ],
            },
          ],
        },
      ]);

      expect(editor.children[0].children[0].type).toBe(ELEMENT_TABLE_CAPTION);
    });
  });
});
