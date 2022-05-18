import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { createPlateEditor, TEditor, TElement } from '@udecode/plate';
import {
  getBlockParentPath,
  requireBlockParentPath,
  requirePathBelowBlock,
} from './path';

let editor: TEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
});

describe('getBlockParentPath', () => {
  it('returns the same path given a block path', () => {
    expect(getBlockParentPath(editor, [0])).toEqual([0]);
  });

  it('traverses up to find a block', () => {
    expect(getBlockParentPath(editor, [0, 0])).toEqual([0]);
  });

  it('returns null if there is no block above', () => {
    editor.children.push({ text: '' } as unknown as TElement);
    expect(getBlockParentPath(editor, [1])).toBe(null);
  });
});
describe('requireBlockParentPath', () => {
  it('throws if there is no block above', () => {
    editor.children.push({ text: '' } as unknown as TElement);
    expect(() => requireBlockParentPath(editor, [1])).toThrow(/block/i);
  });
});

describe('requirePathBelowBlock', () => {
  it('returns the next path given a block path', () => {
    expect(requirePathBelowBlock(editor, [0])).toEqual([1]);
  });

  it('traverses up to find a block before returning the next path', () => {
    expect(requirePathBelowBlock(editor, [0, 0])).toEqual([1]);
  });
});
