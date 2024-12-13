import { beforeEach, expect, describe, it } from 'vitest';
import type { TimeSeriesElement, TableElement } from '@decipad/editor-types';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_TH,
  ELEMENT_TIME_SERIES_TR,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  createMyPlateEditor,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
} from '@decipad/editor-types';
import type { TEditor } from '@udecode/plate-common';
import { findNode, normalizeEditor } from '@udecode/plate-common';
import { createNormalizeTimeSeriesPlugin } from './createNormalizeTimeSeriesPlugin';

describe('createNormalizeTimeSeriesPlugin', () => {
  let editor: TEditor;
  beforeEach(() => {
    editor = createMyPlateEditor({
      plugins: [createNormalizeTimeSeriesPlugin()],
    });
  });

  it('normalizes', () => {
    editor.children = [
      {
        type: ELEMENT_TIME_SERIES,
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
                type: 'time-series-name',
              },
            ],
            type: 'time-series-caption',
          },
          {
            children: [{ text: '' }],
            type: 'time-series-tr',
          },
        ],
        type: 'time-series',
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
        type: ELEMENT_TIME_SERIES,
        id: 'dv',
        children: [
          // TimeSeriesCaptionElement
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
          // TimeSeriesHeaderRowElement
          {
            type: ELEMENT_TIME_SERIES_TR,
            id: 'dvheaderrow',
            children: [
              // TimeSeriesHeader
              {
                type: ELEMENT_TIME_SERIES_TH,
                id: 'dvth1',
                cellType: { kind: 'number' },
                name: 'bad-and-wrong-table-formula-id',
                label: 'BadWrong',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      } as TimeSeriesElement,
    ];

    normalizeEditor(editor, { force: true });

    const TimeSeriesTh = findNode(editor, { match: { id: 'dvth1' } })?.[0];
    expect(TimeSeriesTh?.name).toMatchInlineSnapshot(
      `"based-and-correct-th-id"`
    );
  });
});
