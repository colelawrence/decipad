import {
  createEditorPlugins,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  SPEditor,
} from '@udecode/plate';
import {
  insertCodeBlockBelow,
  insertCodeBlockBelowOrReplace,
} from './codeBlock';

let editor: SPEditor;
beforeEach(() => {
  editor = createEditorPlugins();
  editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
});

describe('insertCodeBlockBelow', () => {
  it('inserts a code block including a code line', () => {
    insertCodeBlockBelow(editor, [0]);
    expect(editor.children[1]).toMatchObject({
      type: ELEMENT_CODE_BLOCK,
      children: [{ type: ELEMENT_CODE_LINE }],
    });
  });

  it('inserts at block level', () => {
    insertCodeBlockBelow(editor, [0, 0]);
    expect(editor.children).toHaveLength(2);
  });

  describe('with the select option', () => {
    it('selects the code line inside the new code block', () => {
      insertCodeBlockBelow(editor, [0], true);
      expect(editor.selection?.anchor.path?.slice(0, 2)).toEqual([1, 0]);
    });
  });
});

describe('insertCodeBlockBelowOrReplace', () => {
  it('replaces the block if empty', () => {
    editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
    insertCodeBlockBelowOrReplace(editor, [0]);
    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toHaveProperty('type', ELEMENT_CODE_BLOCK);
  });
  it('inserts below the block if not empty', () => {
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
    ];
    insertCodeBlockBelowOrReplace(editor, [0]);
    expect(editor.children).toHaveLength(2);
  });
});
