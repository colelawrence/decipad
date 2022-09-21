import {
  createTPlateEditor,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  MyElement,
} from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeListPlugin } from './createNormalizeListPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeListPlugin()],
  });
});

describe.each([ELEMENT_UL, ELEMENT_OL])('a %s list', (type) => {
  it('cannot have extra properties', () => {
    editor.children = [{ type, children: [{ text: '' }], extra: true }];
    expect(editor).toHaveProperty('children.0.extra');
    normalizeEditor(editor, { force: true });
    expect(editor).not.toHaveProperty('children.0.extra');
  });

  it('must have at least one list item child', () => {
    editor.children = [{ type, children: [] }];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      { type, children: [expect.objectContaining({ type: ELEMENT_LI })] },
    ] as MyElement[]);
  });

  it('cannot have other elements as children', () => {
    editor.children = [
      {
        type,
        children: [
          { type: ELEMENT_PARAGRAPH, children: [] },
          { type: ELEMENT_UL, children: [] },
        ],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type,
        children: [
          expect.objectContaining({ type: ELEMENT_LI }),
          expect.objectContaining({ type: ELEMENT_LI }),
        ],
      },
    ] as MyElement[]);
  });
  it('cannot contain text as a child', () => {
    editor.children = [
      {
        type,
        children: [{ text: '' }],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toEqual([
      { type, children: [expect.objectContaining({ type: ELEMENT_LI })] },
    ] as MyElement[]);
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
          },
        ],
      },
    ];
    expect(editor).toHaveProperty('children.0.children.0.extra');
    normalizeEditor(editor, { force: true });
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
      ];
      normalizeEditor(editor, { force: true });
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
      ]);
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
      ];
      normalizeEditor(editor, { force: true });
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
      ]);
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
    ];
    normalizeEditor(editor, { force: true });
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
    ];
    normalizeEditor(editor, { force: true });
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
    ]);
  });

  it('cannot contain another element', () => {
    editor.children = [
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ ELEMENT_PARAGRAPH, children: [{ text: 'text' }] }],
          } as never,
        ],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ type: ELEMENT_LIC, children: [{ text: 'text' }] }],
          },
        ],
      },
    ]);
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
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_UL,
        children: [
          {
            type: ELEMENT_LI,
            children: [{ type: ELEMENT_LIC, children: [{ text: 'text' }] }],
          },
        ],
      },
    ]);
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
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
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
    ]);
  });
});
