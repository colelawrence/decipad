import { beforeEach, expect, describe, it } from 'vitest';
import { EditorController } from '@decipad/notebook-tabs';
import { callAction } from '../callAction';
import type { MyEditor } from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import type { Computer } from '@decipad/computer-interfaces';
import { updateTableCell } from './updateTableCell';
import { plugins } from '../../../editor-config/src/configuration/plugins';

describe('updateTableCell', () => {
  let editor: EditorController;
  let subEditor: MyEditor;
  let computer: Computer;

  beforeEach(() => {
    computer = getComputer();
    editor = new EditorController('id', plugins({ computer }));
    editor.forceNormalize();
    subEditor = editor.getTabEditorAt(0);
  });

  it('needs arguments', async () => {
    await expect(() =>
      callAction({
        editor,
        subEditor,
        computer,
        action: updateTableCell,
        params: {},
      })
    ).rejects.toMatchInlineSnapshot(`
      [Error: Error in key "tableId": Required
      Error in key "columnName": Required
      Error in key "rowIndex": Required
      Error in key "newCellContent": Required]
    `);
  });

  it('throw if cannot find', async () => {
    await expect(() =>
      callAction({
        editor,
        subEditor,
        computer,
        action: updateTableCell,
        params: {
          tableId: 'does',
          columnName: 'not',
          rowIndex: 10,
          newCellContent: 'exist',
        },
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: Could not find an element with id does]`
    );
  });

  it('errors if cannot find column', async () => {
    subEditor.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TABLE,
        id: 'tableid',
        children: [
          {
            type: ELEMENT_TABLE_CAPTION,
            id: 'captionid',
            children: [
              {
                type: ELEMENT_TABLE_VARIABLE_NAME,
                id: 'varnameid',
                children: [{ text: 'tablename' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'tableheaderrowid',
            children: [
              {
                type: ELEMENT_TH,
                cellType: { kind: 'unknown' },
                id: 'firstcolid',
                children: [{ text: 'Column1' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'firstRow',
            children: [
              {
                type: ELEMENT_TD,
                id: 'firstrowid',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    });
    await expect(() =>
      callAction({
        editor,
        subEditor,
        computer,
        action: updateTableCell,
        params: {
          tableId: 'tableid',
          columnName: 'not',
          rowIndex: 10,
          newCellContent: 'exist',
        },
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: That table does not have a column named "not"]`
    );
  });

  it('works', async () => {
    subEditor.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TABLE,
        id: 'tableid',
        children: [
          {
            type: ELEMENT_TABLE_CAPTION,
            id: 'tablecaptionid',
            children: [
              {
                type: ELEMENT_TABLE_VARIABLE_NAME,
                id: 'tablevarnameid',
                children: [{ text: 'tablename' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'firstrowid',
            children: [
              {
                type: ELEMENT_TH,
                id: 'firstcolid',
                cellType: { kind: 'unknown' },
                children: [
                  {
                    text: 'Column1',
                  },
                ],
              },
              {
                type: ELEMENT_TH,
                id: 'secondcolid',
                cellType: { kind: 'unknown' },
                children: [
                  {
                    text: 'Column2',
                  },
                ],
              },
              {
                type: ELEMENT_TH,
                id: 'secondcolid',
                cellType: { kind: 'unknown' },
                children: [
                  {
                    text: 'Column3',
                  },
                ],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'secondrowid',
            children: [
              {
                type: ELEMENT_TD,
                id: 'firstcolid2',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                type: ELEMENT_TD,
                id: 'secondcolid2',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                type: ELEMENT_TD,
                id: 'secondcolid2',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    await callAction({
      editor,
      subEditor,
      computer,
      action: updateTableCell,
      params: {
        tableId: 'tableid',
        columnName: 'Column2',
        rowIndex: 0,
        newCellContent: 'new cell content',
      },
    });
    expect(subEditor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'tablename',
                  },
                ],
                id: 'tablevarnameid',
                type: 'table-var-name',
              },
            ],
            id: 'tablecaptionid',
            type: 'table-caption',
          },
          {
            children: [
              {
                cellType: {
                  kind: 'unknown',
                },
                children: [
                  {
                    text: 'Column1',
                  },
                ],
                id: 'firstcolid',
                type: 'th',
              },
              {
                cellType: {
                  kind: 'unknown',
                },
                children: [
                  {
                    text: 'Column2',
                  },
                ],
                id: 'secondcolid',
                type: 'th',
              },
              {
                cellType: {
                  kind: 'unknown',
                },
                children: [
                  {
                    text: 'Column3',
                  },
                ],
                id: 'secondcolid',
                type: 'th',
              },
            ],
            id: 'firstrowid',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'td',
              },
              {
                children: [
                  {
                    text: 'new cell content',
                  },
                ],
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        id: 'tableid',
        type: 'table',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
    ]);
  });

  it('works by adding rows', async () => {
    subEditor.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TABLE,
        id: 'tableid',
        children: [
          {
            type: ELEMENT_TABLE_CAPTION,
            id: 'tablecaptionid',
            children: [
              {
                type: ELEMENT_TABLE_VARIABLE_NAME,
                id: 'tablevarnameid',
                children: [{ text: 'tablename' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'firstrowid',
            children: [
              {
                type: ELEMENT_TH,
                id: 'firstcolid',
                cellType: { kind: 'unknown' },
                children: [
                  {
                    text: 'Column1',
                  },
                ],
              },
              {
                type: ELEMENT_TH,
                id: 'secondcolid',
                cellType: { kind: 'unknown' },
                children: [
                  {
                    text: 'Column2',
                  },
                ],
              },
              {
                type: ELEMENT_TH,
                id: 'secondcolid',
                cellType: { kind: 'unknown' },
                children: [
                  {
                    text: 'Column3',
                  },
                ],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'secondrowid',
            children: [
              {
                type: ELEMENT_TD,
                id: 'firstcolid2',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                type: ELEMENT_TD,
                id: 'secondcolid2',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                type: ELEMENT_TD,
                id: 'secondcolid2',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    await callAction({
      editor,
      subEditor,
      computer,
      action: updateTableCell,
      params: {
        tableId: 'tableid',
        columnName: 'Column2',
        rowIndex: 1,
        newCellContent: 'new cell content',
      },
    });
    expect(subEditor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'tablename',
                  },
                ],
                id: 'tablevarnameid',
                type: 'table-var-name',
              },
            ],
            id: 'tablecaptionid',
            type: 'table-caption',
          },
          {
            children: [
              {
                cellType: {
                  kind: 'unknown',
                },
                children: [
                  {
                    text: 'Column1',
                  },
                ],
                id: 'firstcolid',
                type: 'th',
              },
              {
                cellType: {
                  kind: 'unknown',
                },
                children: [
                  {
                    text: 'Column2',
                  },
                ],
                id: 'secondcolid',
                type: 'th',
              },
              {
                cellType: {
                  kind: 'unknown',
                },
                children: [
                  {
                    text: 'Column3',
                  },
                ],
                id: 'secondcolid',
                type: 'th',
              },
            ],
            id: 'firstrowid',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'firstcolid2',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'secondcolid2',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'secondcolid2',
                type: 'td',
              },
            ],
            id: 'secondrowid',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'td',
              },
              {
                children: [
                  {
                    text: 'new cell content',
                  },
                ],
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        id: 'tableid',
        type: 'table',
        version: 2,
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
    ]);
  });
});
