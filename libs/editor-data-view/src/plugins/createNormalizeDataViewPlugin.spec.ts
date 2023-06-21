import {
  DataViewElement,
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  ELEMENT_DATA_VIEW_TH,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  TableElement,
  createTPlateEditor,
} from '@decipad/editor-types';
import { TEditor, findNode, normalizeEditor } from '@udecode/plate';
import { createNormalizeDataViewPlugin } from './createNormalizeDataViewPlugin';

describe('createNormalizeDataViewPlugin', () => {
  let editor: TEditor;
  beforeEach(() => {
    editor = createTPlateEditor({
      plugins: [createNormalizeDataViewPlugin()],
    });
  });

  it('normalizes', () => {
    editor.children = [
      {
        type: ELEMENT_DATA_VIEW,
        children: [],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                type: 'data-view-name',
              },
            ],
            type: 'data-view-caption',
          },
          {
            children: [{ text: '' }],
            type: 'data-view-tr',
          },
        ],
        type: 'data-view',
      },
    ]);
  });

  it('migrates from table formula IDs to table column IDs', () => {
    editor.children = [
      {
        type: ELEMENT_TABLE,
        id: 'table',
        children: [
          {
            type: ELEMENT_TABLE_CAPTION,
            id: 'caption',
            children: [
              {
                type: ELEMENT_TABLE_VARIABLE_NAME,
                id: 'tablevar',
                children: [{ text: 'Table 1' }],
              },
              {
                type: ELEMENT_TABLE_COLUMN_FORMULA,
                id: 'bad-and-wrong-table-formula-id',
                columnId: 'based-and-correct-th-id',
                children: [{ text: 'Column 1' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'headerrow',
            children: [
              {
                type: ELEMENT_TH,
                id: 'based-and-correct-th-id',
                cellType: { kind: 'table-formula' },
                children: [{ text: '1 + 1' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'datarow',
            children: [
              {
                type: ELEMENT_TD,
                id: 'td1',
                children: [{ text: 'Column 1' }],
              },
            ],
          },
        ],
      } as TableElement,
      {
        type: ELEMENT_DATA_VIEW,
        id: 'dv',
        children: [
          // DataViewCaptionElement
          {
            type: ELEMENT_DATA_VIEW_CAPTION,
            id: 'dvcaption',
            children: [
              {
                type: ELEMENT_DATA_VIEW_NAME,
                id: 'dvvar',
                children: [{ text: 'Table 1' }],
              },
            ],
          },
          // DataViewHeaderRowElement
          {
            type: ELEMENT_DATA_VIEW_TR,
            id: 'dvheaderrow',
            children: [
              // DataViewHeader
              {
                type: ELEMENT_DATA_VIEW_TH,
                id: 'dvth1',
                cellType: { kind: 'number' },
                name: 'bad-and-wrong-table-formula-id',
                label: 'BadWrong',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      } as DataViewElement,
    ];

    normalizeEditor(editor, { force: true });

    const dataViewTh = findNode(editor, { match: { id: 'dvth1' } })?.[0];
    expect(dataViewTh?.name).toMatchInlineSnapshot(`"based-and-correct-th-id"`);
  });
});
