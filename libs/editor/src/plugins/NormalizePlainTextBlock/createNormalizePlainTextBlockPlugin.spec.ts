import { Editor } from 'slate';
import { createEditorPlugins, TElement } from '@udecode/plate';
import {
  Element,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_LINK,
} from '../../elements';
import { MARK_BOLD } from '../../marks';
import { createNormalizePlainTextBlockPlugin } from './createNormalizePlainTextBlockPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizePlainTextBlockPlugin()],
  });
});

describe.each([ELEMENT_H1, ELEMENT_H2, ELEMENT_H3] as const)(
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
          children: [{ text: '' }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          children: [{ text: '' }],
        },
      ] as Element[]);
    });
    it('cannot contain rich text', () => {
      editor.children = [
        {
          type,
          children: [{ text: '', [MARK_BOLD]: true }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          children: [{ text: '' }],
        },
      ] as Element[]);
    });

    it('cannot contain other blocks', () => {
      editor.children = [
        {
          type,
          children: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          children: [{ text: '' }],
        },
      ] as Element[]);
    });
    it('cannot contain other inline elements', () => {
      editor.children = [
        {
          type,
          children: [
            {
              type: ELEMENT_LINK,
              url: 'https://example.com',
              children: [{ text: 'text' }],
            },
          ],
        } as TElement,
      ];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          children: [{ text: 'text' }],
        },
      ] as Element[]);
    });
  }
);
