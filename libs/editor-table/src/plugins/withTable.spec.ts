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
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  TableElement,
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

  describe('when inserting a table without caption, with th row', () => {
    it('should add empty caption', () => {
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
                  children: [{ text: 'a' }],
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
                  children: [{ text: '2' }],
                },
              ],
            },
          ],
        },
      ]);

      expect(editor.children[0].children[0].type).toBe(ELEMENT_TABLE_CAPTION);
      expect(
        (editor.children[0] as TableElement).children[1].children[0].children[0]
          .text
      ).toBe('a');
      expect(
        (editor.children[0] as TableElement).children[2].children[0].children[0]
          .text
      ).toBe('2');
    });
  });

  describe('when inserting a table without caption into a table', () => {
    it('should insert cells', () => {
      editor.children = [
        {
          id: '1',
          type: ELEMENT_TABLE,
          children: [
            {
              type: ELEMENT_TABLE_CAPTION,
              children: [
                {
                  type: ELEMENT_TABLE_VARIABLE_NAME,
                  children: [{ text: '' }],
                },
              ],
            },
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
      ] as never;
      editor.selection = {
        anchor: { path: [0, 2, 0, 0], offset: 0 },
        focus: { path: [0, 2, 0, 0], offset: 0 },
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
                  type: ELEMENT_TD,
                  children: [{ text: '1' }],
                },
              ],
            },
          ],
        },
      ]);

      expect(
        (editor.children[0] as TableElement).children[2].children[0].children[0]
          .text
      ).toBe('1');
    });
  });

  describe('when inserting a table without caption, without th row', () => {
    it('should add empty th row', () => {
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
                  type: ELEMENT_TD,
                  children: [{ text: '1' }],
                },
              ],
            },
          ],
        },
      ]);

      expect(
        (editor.children[0] as TableElement).children[2].children[0].children[0]
          .text
      ).toBe('1');
    });
  });
});
