import {
  createEditorPlugins,
  ELEMENT_PARAGRAPH,
  SPEditor,
} from '@udecode/plate';
import { getBlockParentPath, getPathBelowBlock } from './path';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
});

describe('getBlockParentPath', () => {
  it('returns the same path given a block path', () => {
    expect(getBlockParentPath(editor, [0])).toEqual([0]);
  });

  it('traverses up to find a block', () => {
    expect(getBlockParentPath(editor, [0, 0])).toEqual([0]);
  });

  it('throws if there is no block above', () => {
    editor.children.push({ text: '' });
    expect(() => getBlockParentPath(editor, [1])).toThrow(/block/i);
  });
});

describe('getPathBelowBlock', () => {
  it('returns the next path given a block path', () => {
    expect(getPathBelowBlock(editor, [0])).toEqual([1]);
  });

  it('traverses up to find a block before returning the next path', () => {
    expect(getPathBelowBlock(editor, [0, 0])).toEqual([1]);
  });
});
