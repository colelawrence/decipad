import { Editor } from 'slate';
import { createEditorPlugins, TElement } from '@udecode/plate';
import {
  Element,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_PARAGRAPH,
  ELEMENT_LINK,
  ELEMENT_LIC,
} from '../../elements';
import { MARK_BOLD } from '../../marks';
import { createNormalizeRichTextBlockPlugin } from './createNormalizeRichTextBlockPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
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
          children: [{ text: '', [MARK_BOLD]: true }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [{ text: '', [MARK_BOLD]: true }],
        },
      ] as Element[]);
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
      ] as Element[]);
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
      ] as Element[]);
    });
  }
);
