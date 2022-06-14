import {
  createTPlateEditor,
  ELEMENT_TABLE_CAPTION,
} from '@decipad/editor-types';
import { Range } from 'slate';
import { selectColumn } from './selectColumn';

describe('selectColumn', () => {
  it('should be', () => {
    const editor = createTPlateEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          { type: ELEMENT_TABLE_CAPTION, children: [{ text: 'TableName' }] },
          {
            type: 'tr',
            children: [
              { type: 'th', cellType: { kind: 'string' } },
              { type: 'th', cellType: { kind: 'table-formula' } },
            ],
          },
          {
            type: 'tr',
            children: [
              { type: 'td', children: [{ text: 'allowed' }] },
              { type: 'td', children: [{ text: '' }] },
            ],
          },
          {
            type: 'tr',
            children: [
              { type: 'td', children: [{ text: 'allowed' }] },
              { type: 'td', children: [{ text: '' }] },
            ],
          },
        ],
      },
    ] as never;
    editor.selection = {
      anchor: {
        path: [0, 1, 1],
        offset: 0,
      },
      focus: {
        path: [0, 1, 1],
        offset: 0,
      },
    };

    const expected: Range = {
      anchor: {
        path: [0, 2, 1, 0],
        offset: 0,
      },
      focus: {
        path: [0, 3, 1, 0],
        offset: 0,
      },
    };

    selectColumn(editor, [0, 1, 1]);

    expect(editor.selection).toEqual(expected);
  });
});
