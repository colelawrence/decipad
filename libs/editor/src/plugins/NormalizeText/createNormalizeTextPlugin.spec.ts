import { Editor } from 'slate';
import { createEditorPlugins, TDescendant } from '@udecode/plate';
import { createNormalizeTextPlugin } from './createNormalizeTextPlugin';
import { ELEMENT_PARAGRAPH } from '../../elements';
import { MARK_BOLD } from '../../marks';

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
