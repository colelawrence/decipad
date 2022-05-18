import { createTPlateEditor, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeElementIdPlugin } from './createNormalizeElementIdPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeElementIdPlugin()],
  });
});

it('requires an id on elements', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text' }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor).toHaveProperty('children.0.id', expect.stringMatching(/.+/));
});

it('does not require an id on text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text' }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor).not.toHaveProperty('children.0.children.0.id');
});

it('does not allow the id to be the empty string', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      id: '',
      children: [{ text: 'text' }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor).toHaveProperty('children.0.id', expect.stringMatching(/.+/));
});
