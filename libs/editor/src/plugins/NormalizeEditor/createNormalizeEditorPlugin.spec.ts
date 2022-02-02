import { createEditorPlugins, TDescendant, TElement } from '@udecode/plate';
import { Editor, Transforms } from 'slate';
import { createNormalizeEditorPlugin } from './createNormalizeEditorPlugin';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_LINE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  H1Element,
} from '../../elements';

const h1Element = (): H1Element => ({
  type: ELEMENT_H1,
  children: [{ text: '' }],
});

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizeEditorPlugin()],
  });
});

describe('the title normalization', () => {
  it('forces the first block to be an H1', () => {
    editor.children = [
      {
        type: ELEMENT_H2,
        children: [{ text: '' }],
      } as TElement,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([h1Element()]);
  });
  it('forces the first H1 to exist', () => {
    editor.children = [];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([h1Element()]);
  });
  it('forbids H1s in the second to last elements and converts them to paragraphs', () => {
    editor.children = [h1Element(), h1Element()] as TElement[];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      expect.anything(),
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ]);
  });
  it('applies to moved but unchanged blocks', () => {
    editor.children = [
      { type: ELEMENT_H1, children: [{ text: 'text' }] },
    ] as TElement[];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    editor.insertNode({ children: [{ text: '' }] });
    expect(editor.children).toEqual([
      h1Element(),
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'text' }],
      },
    ]);
  });
});

it.each([ELEMENT_H2, ELEMENT_UL, ELEMENT_BLOCKQUOTE])(
  'allows the %s element at top level',
  (type) => {
    editor.children = [
      h1Element(),
      {
        type,
        children: [{ text: '' }],
      } as TDescendant,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      expect.anything(),
      { type, children: [{ text: '' }] },
    ]);
  }
);
it.each([ELEMENT_LI, ELEMENT_LINK, ELEMENT_CODE_LINE, 'asdf'])(
  'converts the %s element forbidden at top level to a paragraph',
  (type) => {
    editor.children = [
      h1Element(),
      {
        type,
        children: [{ text: '' }],
      } as TDescendant,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      expect.anything(),
      { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
    ]);
  }
);

it('converts text at top level to a paragraph', () => {
  editor.children = [h1Element(), { text: '' }];
  Editor.normalize(editor, { force: true });
  expect(editor.children).toEqual([
    expect.anything(),
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
  ]);
});
