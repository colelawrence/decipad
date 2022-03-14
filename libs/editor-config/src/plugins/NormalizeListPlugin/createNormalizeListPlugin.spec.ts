import {
  Element,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
} from '@decipad/editor-types';
import { createEditorPlugins, TElement } from '@udecode/plate';
import { Editor } from 'slate';
import { createNormalizeListPlugin } from './createNormalizeListPlugin';

let editor: Editor;
beforeEach(() => {
  editor = createEditorPlugins({
    plugins: [createNormalizeListPlugin()],
  });
});

describe.each([ELEMENT_UL, ELEMENT_OL])('a %s list', (type) => {
  it('cannot have extra properties', () => {
    editor.children = [
      { type, children: [{ text: '' }], extra: true } as TElement,
    ];
    expect(editor).toHaveProperty('children.0.extra');
    Editor.normalize(editor, { force: true });
    expect(editor).not.toHaveProperty('children.0.extra');
  });

  it('must have at least one list item child', () => {
    editor.children = [{ type, children: [] } as TElement];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type, children: [expect.objectContaining({ type: ELEMENT_LI })] },
    ] as Element[]);
  });

  it('cannot have other elements as children', () => {
    editor.children = [
      {
        type,
        children: [
          { type: ELEMENT_PARAGRAPH, children: [] },
          { type: ELEMENT_UL, children: [] },
        ],
      } as TElement,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type,
        children: [
          expect.objectContaining({ type: ELEMENT_LI }),
          expect.objectContaining({ type: ELEMENT_LI }),
        ],
      },
    ] as Element[]);
  });
  it('cannot contain text as a child', () => {
    editor.children = [
      {
        type,
        children: [{ text: '' }],
      } as TElement,
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      { type, children: [expect.objectContaining({ type: ELEMENT_LI })] },
    ] as Element[]);
  });
});

describe('a list item', () => {
  it('cannot have extra properties', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [],
            extra: true,
          } as TElement,
        ],
      },
    ] as TElement[];
    expect(editor).toHaveProperty('children.0.children.0.extra');
    Editor.normalize(editor, { force: true });
    expect(editor).not.toHaveProperty('children.0.children.0.extra');
  });

  it.each([ELEMENT_UL, ELEMENT_OL])(
    'can contain another %s list as the second child',
    (type) => {
      editor.children = [
        {
          type: ELEMENT_UL,
          children: [
            {
              type: ELEMENT_LI,
              children: [
                { type: ELEMENT_LIC, children: [{ text: 'text' }] },
                { type, children: [{ text: '' }] },
              ],
            },
          ],
        },
      ] as TElement[];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type: ELEMENT_UL,
          children: [
            {
              type: ELEMENT_LI,
              children: [
                { type: ELEMENT_LIC, children: [{ text: 'text' }] },
                expect.objectContaining({ type }),
              ],
            },
          ],
        },
      ] as Element[]);
    }
  );
  it.each([ELEMENT_UL, ELEMENT_OL])(
    'cannot contain another %s list as the first child',
    (type) => {
      editor.children = [
        {
          type: ELEMENT_UL,
          children: [
            {
              type: ELEMENT_LI,
              children: [
                { type, children: [{ text: '' }] },
                { type: ELEMENT_LIC, children: [{ text: 'text' }] },
              ],
            },
          ],
        },
      ] as TElement[];
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual([
        {
          type: ELEMENT_UL,
          children: [
            {
              type: ELEMENT_LI,
              children: [expect.objectContaining({ type: ELEMENT_LIC })],
            },
          ],
        },
      ] as Element[]);
    }
  );

  it('can contain list item content as the first child', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ type: ELEMENT_LIC, children: [] }],
          },
        ],
      },
    ] as TElement[];
    Editor.normalize(editor, { force: true });
    expect(editor).toHaveProperty(
      'children.0.children.0.children.0.type',
      ELEMENT_LIC
    );
  });
  it('cannot contain list item content as the second child', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [
              { type: ELEMENT_LIC, children: [{ text: 'a' }] },
              { type: ELEMENT_LIC, children: [{ text: 'b' }] },
            ],
          },
        ],
      },
    ] as TElement[];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ type: ELEMENT_LIC, children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as Element[]);
  });

  it('cannot contain another element', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }],
          },
        ],
      },
    ] as TElement[];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ type: ELEMENT_LIC, children: [{ text: 'text' }] }],
          },
        ],
      },
    ] as Element[]);
  });
  it('cannot contain text', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ text: 'text' }],
          },
        ],
      },
    ] as TElement[];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ type: ELEMENT_LIC, children: [{ text: 'text' }] }],
          },
        ],
      },
    ] as Element[]);
  });

  it('cannot contain more than two children', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [
              { type: ELEMENT_LIC, children: [{ text: 'text' }] },
              { type: ELEMENT_UL, children: [{ text: '' }] },
              { type: ELEMENT_LIC, children: [{ text: 'other' }] },
            ],
          },
        ],
      },
    ] as TElement[];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [
              expect.objectContaining({ type: ELEMENT_LIC }),
              expect.objectContaining({ type: ELEMENT_UL }),
            ],
          },
        ],
      },
    ] as Element[]);
  });
});
