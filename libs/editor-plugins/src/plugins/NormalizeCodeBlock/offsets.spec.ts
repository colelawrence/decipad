import { Location } from 'slate';
import { createTEditor, select } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';
import {
  getCodeBlockOffsets,
  reinstateCursorOffsets as reinstateOffsets,
} from './offsets';

describe('offsets', () => {
  it('works getting offset from an editor with no selection', () => {
    const editor = createTEditor();
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
          },
        ],
      },
    ];
    expect(getCodeBlockOffsets(editor as MyEditor, [0])).toMatchObject({
      anchor: null,
      focus: null,
    });
  });

  it('works getting offset from an editor with selection', () => {
    const editor = createTEditor();
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
          },
          {
            type: 'code_line',
            children: [
              {
                text: 'efgh',
              },
            ],
          },
        ],
      },
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
    select(editor, location);
    expect(getCodeBlockOffsets(editor as MyEditor, [0])).toMatchObject({
      anchor: 6,
      focus: 6,
    });
  });

  it('setting an offset', () => {
    const editor = createTEditor();
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
          },
          {
            type: 'code_line',
            children: [
              {
                text: 'efgh',
              },
            ],
          },
        ],
      },
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
    select(editor, location);
    reinstateOffsets(editor as MyEditor, [0], {
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
