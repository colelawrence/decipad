import {
  SPEditor,
  createEditorPlugins,
  ELEMENT_PARAGRAPH,
  ELEMENT_CODE_BLOCK,
  TElement,
} from '@udecode/plate';
import { closestBlockAncestorHasType, insertBlockOfTypeBelow } from './block';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
});

describe('nearestBlockAncestorHasType', () => {
  it('returns true if the surrounding block has the right type', () => {
    expect(closestBlockAncestorHasType(editor, [0, 0], ELEMENT_PARAGRAPH)).toBe(
      true
    );
  });
  it('returns false if the surrounding block has a wrong type', () => {
    expect(
      closestBlockAncestorHasType(editor, [0, 0], ELEMENT_CODE_BLOCK)
    ).toBe(false);
  });
  it('only considers the closest ancestor block', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [
          {
            type: ELEMENT_CODE_BLOCK,
            children: [{ text: '' }],
          } as TElement,
        ],
      },
    ];
    expect(
      closestBlockAncestorHasType(editor, [0, 0, 0], ELEMENT_PARAGRAPH)
    ).toBe(false);
  });
});

describe('insertBlockOfTypeBelow', () => {
  it('inserts a block of given type', () => {
    insertBlockOfTypeBelow(editor, [0], ELEMENT_CODE_BLOCK);
    expect(editor.children[1]).toHaveProperty('type', ELEMENT_CODE_BLOCK);
  });

  it('inserts at block level even given a text node path', () => {
    insertBlockOfTypeBelow(editor, [0, 0], ELEMENT_CODE_BLOCK);
    expect(editor.children).toHaveLength(2);
  });
});
