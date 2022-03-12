import { Editor } from 'slate';
import { createEditorPlugins, TDescendant } from '@udecode/plate';
import { ELEMENT_PARAGRAPH, MARK_BOLD } from '@decipad/editor-types';
import { createNormalizeTextPlugin } from './createNormalizeTextPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizeTextPlugin()],
  });
});

it('allows rich text marks on text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text', [MARK_BOLD]: true }],
    },
  ] as TDescendant[];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    expect.objectContaining({
      children: [
        {
          text: 'text',
          [MARK_BOLD]: true,
        },
      ],
    }),
  ]);
});

it('forbids unknown marks on text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text', bs: true }],
    },
  ] as TDescendant[];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    expect.objectContaining({
      children: [{ text: 'text' }],
    }),
  ]);
});
