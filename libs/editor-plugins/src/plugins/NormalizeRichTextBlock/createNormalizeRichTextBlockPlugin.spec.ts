import {
  Element,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  markKinds,
} from '@decipad/editor-types';
import { createPlateEditor, TElement } from '@udecode/plate';
import { Editor } from 'slate';
import { createNormalizeRichTextBlockPlugin } from './createNormalizeRichTextBlockPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [createNormalizeRichTextBlockPlugin()],
  });
});

describe.each([ELEMENT_PARAGRAPH, ELEMENT_BLOCKQUOTE, ELEMENT_LIC] as const)(
  'a %s text block',
  (type) => {
    it('cannot have extra properties', () => {
      editor.children = [
        { type, id: '42', children: [{ text: '' }], extra: true } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        { type, id: '42', children: expect.anything() },
      ] as Element[]);
    });

    it('can contain plain text', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [{ text: '' }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [{ text: '' }],
        },
      ] as Element[]);
    });
    it('can contain rich text', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [{ text: '', [markKinds.MARK_BOLD]: true }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [{ text: '', [markKinds.MARK_BOLD]: true }],
        },
      ]);
    });
    it('can contain link elements', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [
            {
              type: ELEMENT_LINK,
              id: 'id',
              url: 'https://example.com',
              children: [{ text: '' }],
            },
          ],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [
            {
              type: ELEMENT_LINK,
              id: 'id',
              url: 'https://example.com',
              children: [{ text: '' }],
            },
          ],
        },
      ]);
    });

    it('cannot contain other blocks', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [{ text: '' }],
        },
      ]);
    });
  }
);
