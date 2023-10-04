import {
  createTPlateEditor,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  H1Element,
  MyElement,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeEditorPlugin } from './createNormalizeEditorPlugin';

const h1Element = () =>
  ({
    type: ELEMENT_H1,
    children: [{ text: '' }],
  } as H1Element);

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeEditorPlugin()],
  });
});

it.each([
  ELEMENT_H2,
  ELEMENT_UL,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
])('allows the %s element at top level', (type) => {
  editor.children = [
    h1Element(),
    {
      type,
      children: [{ text: '' }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expect.anything(),
    { type, children: [{ text: '' }] },
  ] as MyElement[]);
});
it.each([ELEMENT_LI, ELEMENT_LINK, ELEMENT_CODE_LINE_V2_CODE, 'asdf'])(
  'converts the %s element forbidden at top level to a paragraph',
  (type) => {
    editor.children = [
      h1Element(),
      {
        type,
        children: [{ text: '' }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      expect.anything(),
      { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
    ]);
  }
);

it('converts text at top level to a paragraph', () => {
  editor.children = [h1Element(), { text: '' } as never];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expect.anything(),
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
  ] as MyElement[]);
});

it('handles no children elements without failing', () => {
  editor.children = [
    {
      type: ELEMENT_H1,
      children: [],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([h1Element()]);
});
