import {
  createTPlateEditor,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  markKinds,
  MyElement,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor, upsertLink } from '@udecode/plate';
import { createNormalizeRichTextBlockPlugin } from './createNormalizeRichTextBlockPlugin';
import { createLinkPlugin } from '../Link/index';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeRichTextBlockPlugin(), createLinkPlugin() as any],
  });
});

describe('when wrapLink when it has a link at start of a block', () => {
  it('should wrap correctly', () => {
    editor.children = [{ type: 'p', children: [{ text: '123 456' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };

    upsertLink(editor as any, {
      url: 'https://google.com',
      isUrl: () => true,
    });

    normalizeEditor(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [
          { text: '' },
          {
            type: 'a',
            url: 'https://google.com',
            target: undefined,
            children: [
              {
                text: '123',
              },
            ],
          },
          { text: ' 456' },
        ],
      },
    ]);
  });
});

describe.each([ELEMENT_PARAGRAPH, ELEMENT_BLOCKQUOTE, ELEMENT_LIC] as const)(
  'a %s text block',
  (type) => {
    it('cannot have extra properties', () => {
      editor.children = [
        { type, id: '42', children: [{ text: '' }], extra: true },
      ];
      normalizeEditor(editor, { force: true });
      expect(editor.children).toMatchObject([
        { type, id: '42', children: expect.anything() },
      ] as MyElement[]);
    });

    it('can contain plain text', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [{ text: '' }],
        },
      ];
      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [{ text: '' }],
        },
      ] as MyElement[]);
    });
    it('can contain rich text', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [{ text: '', [markKinds.MARK_BOLD]: true }],
        },
      ];
      normalizeEditor(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type,
          id: 'id',
          children: [{ text: '', [markKinds.MARK_BOLD]: true }],
        },
      ]);
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('can contain link elements', () => {
      editor.children = [
        {
          type,
          id: 'id',
          children: [
            {
              type: ELEMENT_LINK,
              id: 'id',
              url: 'https://example.com',
              children: [{ text: 'https://example.com' }],
            },
          ],
        },
      ];
      normalizeEditor(editor, { force: true });

      // Links create regular text elements before and after, so that the user
      // may type normal text.
      expect(editor.children).toMatchObject([
        {
          type,
          id: 'id',
          children: [
            { text: '' },
            {
              type: ELEMENT_LINK,
              id: 'id',
              url: 'https://example.com',
              children: [{ text: 'https://example.com' }],
            },
            { text: '' },
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
        },
      ];
      normalizeEditor(editor, { force: true });
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
