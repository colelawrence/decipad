import { expect, beforeEach, describe, it } from 'vitest';
import {
  ELEMENT_LAYOUT,
  ELEMENT_PARAGRAPH,
  LayoutElement,
  MyEditor,
  MyText,
  ParagraphElement,
  createMyPlateEditor,
} from '@decipad/editor-types';
import { getSelectedNodes } from './getSelectedNodes';

type SimpleParagraphElement = ParagraphElement & {
  children: [MyText];
};

let editor: MyEditor & {
  children: [
    SimpleParagraphElement,
    SimpleParagraphElement,
    LayoutElement & {
      children: [SimpleParagraphElement, SimpleParagraphElement];
    }
  ];
};

beforeEach(() => {
  editor = createMyPlateEditor() as any;
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      id: 'paragraph-1',
      children: [{ text: 'Paragraph 1' }],
    },
    {
      type: ELEMENT_PARAGRAPH,
      id: 'paragraph-2',
      children: [{ text: 'Paragraph 2' }],
    },
    {
      type: ELEMENT_LAYOUT,
      id: 'layout',
      children: [
        {
          type: ELEMENT_PARAGRAPH,
          id: 'column-1',
          children: [{ text: 'Column 1' }],
        },
        {
          type: ELEMENT_PARAGRAPH,
          id: 'column-2',
          children: [{ text: 'Column 2' }],
        },
      ],
    },
  ];
});

const paragraph1 = () => editor.children[0];
const paragraph1Text = () => paragraph1().children[0];
const paragraph2 = () => editor.children[1];
const paragraph2Text = () => paragraph2().children[0];
const layout = () => editor.children[2];
const column1 = () => layout().children[0];
const column1Text = () => column1().children[0];
const column2 = () => layout().children[1];
const column2Text = () => column2().children[0];

describe('getSelectedNodes', () => {
  it('returns no nodes when no blocks are selected and selection is null', () => {
    expect(getSelectedNodes(editor, [])).toHaveLength(0);
  });

  describe('slate selection', () => {
    it('returns all ancestors of selection when selection is collapsed', () => {
      const point = { path: [2, 1, 0], offset: 0 };
      editor.selection = { anchor: point, focus: point };
      expect(getSelectedNodes(editor, [])).toEqual([
        layout(),
        column2(),
        column2Text(),
      ]);
    });

    it('returns all nodes touching the selection when selection is expanded', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [2, 0, 0], offset: 1 },
      };
      expect(getSelectedNodes(editor, [])).toEqual([
        paragraph1(),
        paragraph1Text(),
        paragraph2(),
        paragraph2Text(),
        layout(),
        column1(),
        column1Text(),
      ]);
    });
  });

  describe('block selection', () => {
    it('returns selected blocks and their descendants', () => {
      expect(getSelectedNodes(editor, ['layout'])).toEqual([
        layout(),
        column1(),
        column1Text(),
        column2(),
        column2Text(),
      ]);
    });

    it('does not return ancestors of selected blocks', () => {
      expect(getSelectedNodes(editor, ['column-1'])).toEqual([
        column1(),
        column1Text(),
      ]);
    });
  });

  describe('block selection and slate selection', () => {
    it('returns all selected blocks without duplicates', () => {
      // First two paragraphs
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      };

      const selectedBlockIds = ['paragraph-2', 'layout'];

      expect(getSelectedNodes(editor, selectedBlockIds)).toEqual([
        paragraph1(),
        paragraph1Text(),
        paragraph2(),
        paragraph2Text(),
        layout(),
        column1(),
        column1Text(),
        column2(),
        column2Text(),
      ]);
    });
  });
});
