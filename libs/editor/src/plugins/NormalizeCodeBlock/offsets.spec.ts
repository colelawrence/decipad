import { createEditor, Descendant, Location, Transforms } from 'slate';
import {
  getCodeBlockOffsets,
  reinstateCursorOffsets as reinstateOffsets,
} from './offsets';

describe('offsets', () => {
  it('works getting offset from an editor with no selection', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code_block',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'abc',
              },
            ],
          } as Descendant,
        ],
      } as Descendant,
    ];
    expect(getCodeBlockOffsets(editor, [0])).toMatchObject({
      anchor: null,
      focus: null,
    });
  });

  it('works getting offset from an editor with selection', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code_block',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'abcd',
              },
            ],
          } as Descendant,
          {
            type: 'code_line',
            children: [
              {
                text: 'efgh',
              },
            ],
          } as Descendant,
        ],
      } as Descendant,
    ];
    const location: Location = {
      anchor: {
        path: [0, 1, 0],
        offset: 1,
      },
      focus: {
        path: [0, 1, 0],
        offset: 1,
      },
    };
    Transforms.select(editor, location);
    expect(getCodeBlockOffsets(editor, [0])).toMatchObject({
      anchor: 6,
      focus: 6,
    });
  });

  it('setting an offset', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code_block',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'abcd',
              },
            ],
          } as Descendant,
          {
            type: 'code_line',
            children: [
              {
                text: 'efgh',
              },
            ],
          } as Descendant,
        ],
      } as Descendant,
    ];
    const location: Location = {
      anchor: {
        path: [0, 0, 0],
        offset: 1,
      },
      focus: {
        path: [0, 0, 0],
        offset: 1,
      },
    };
    Transforms.select(editor, location);
    reinstateOffsets(editor, [0], {
      anchor: 7,
      focus: 7,
    });
    expect(editor.selection).toMatchObject({
      anchor: {
        path: [0, 1, 0],
        offset: 2,
      },
      focus: {
        path: [0, 1, 0],
        offset: 2,
      },
    });
  });
});
