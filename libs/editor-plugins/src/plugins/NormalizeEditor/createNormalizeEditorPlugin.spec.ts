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
import { normalizeEditor, select, TEditor } from '@udecode/plate';
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

describe('the title normalization', () => {
  it('forces the first block to be an H1', () => {
    editor.children = [
      {
        type: ELEMENT_H2,
        children: [{ text: '' }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([h1Element()]);
  });

  it('forces the first H1 to exist', () => {
    editor.children = [];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([h1Element()]);
  });

  it('forbids H1s in the second to last elements and converts them to paragraphs', () => {
    editor.children = [h1Element(), h1Element()];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      expect.anything(),
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ] as MyElement[]);
  });

  it('applies to moved but unchanged blocks', () => {
    editor.children = [{ type: ELEMENT_H1, children: [{ text: 'text' }] }];
    select(editor, { path: [0, 0], offset: 0 });
    editor.insertNode({ children: [{ text: '' }] } as never);
    expect(editor.children).toMatchObject([
      h1Element(),
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'text' }],
      },
    ] as MyElement[]);
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
