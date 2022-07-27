import { createTPlateEditor, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeNewParagraphPlugin } from '..';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeNewParagraphPlugin()],
  });
});

describe('new paragraph under non-empty paragraphs', () => {
  it('creates new paragraph if last paragraph isnt empty', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [
          {
            text: 'not empty',
          },
        ],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children.length).toBe(2);
    expect(editor.children[1].type).toBe(ELEMENT_PARAGRAPH);
    expect(editor.children[1].children[0].text).toHaveLength(0);
  });
  it('doesnt create a new paragraph if last element paragraph is empty', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [
          {
            text: '',
          },
        ],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children.length).toBe(1);
  });
});
