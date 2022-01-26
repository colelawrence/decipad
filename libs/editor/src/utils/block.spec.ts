import { SPEditor, createEditorPlugins, TElement } from '@udecode/plate';
import {
  allowsTextStyling,
  closestBlockAncestorHasType,
  insertBlockOfTypeBelow,
} from './block';
import { ELEMENT_CODE_BLOCK, ELEMENT_PARAGRAPH } from '../elements';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
});

describe('closestBlockAncestorHasType', () => {
  it('returns false if there is no surrounding block', () => {
    expect(closestBlockAncestorHasType(editor, [], ELEMENT_PARAGRAPH)).toBe(
      false
    );
  });

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

describe('allowsTextStyling', () => {
  it('returns false for a null path', () => {
    expect(allowsTextStyling(editor, null)).toBe(false);
  });

  it('returns true in a paragraph', () => {
    expect(allowsTextStyling(editor, [0, 0])).toBe(true);
  });
  it('returns false in a code block', () => {
    editor.children = [
      {
        type: ELEMENT_CODE_BLOCK,
        children: [{ text: '' }],
      },
    ];
    expect(allowsTextStyling(editor, [0, 0])).toBe(false);
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
