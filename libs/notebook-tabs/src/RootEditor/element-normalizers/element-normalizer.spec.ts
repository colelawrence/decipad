import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_PLOT,
  ELEMENT_STRUCTURED_VARNAME,
  PlotElement,
} from '@decipad/editor-types';
import { TEditor } from '@udecode/plate-common';
import { createEditor } from 'slate';
import {
  createNormalizer,
  elementKindsToDefaults,
  normalizeElement,
} from './element-normalizer';
import { normalizeCurried } from '../normalizeNode';

vi.mock('nanoid', () => {
  return {
    nanoid: () => 'mocked-id',
  };
});

describe('element type map', () => {
  it('snapshots entire map', () => {
    expect(elementKindsToDefaults).toMatchInlineSnapshot(`
      {
        "data-tab-children": {
          "children": [
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "endpointUrlSecretName": "some-string-that-is-hard-to-guess",
              "id": "mocked-id",
              "isHidden": "some-string-that-is-hard-to-guess",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "endpointUrlSecretName": "some-string-that-is-hard-to-guess",
              "id": "mocked-id",
              "isHidden": "some-string-that-is-hard-to-guess",
              "type": "code_line_v2_code",
            },
          ],
          "endpointUrlSecretName": "some-string-that-is-hard-to-guess",
          "id": "mocked-id",
          "isHidden": "some-string-that-is-hard-to-guess",
          "type": "data-tab-children",
        },
        "plot": {
          "arcVariant": "simple",
          "barVariant": "grouped",
          "children": [
            {
              "text": "",
            },
          ],
          "colorScheme": "some-string-that-is-hard-to-guess",
          "endpointUrlSecretName": "some-string-that-is-hard-to-guess",
          "flipTable": false,
          "grid": false,
          "groupByX": false,
          "id": "mocked-id",
          "isHidden": "some-string-that-is-hard-to-guess",
          "labelColumnName": "some-string-that-is-hard-to-guess",
          "lineVariant": "area",
          "markType": "line",
          "mirrorYAxis": false,
          "orientation": "vertical",
          "schema": "jun-2024",
          "showDataLabel": false,
          "sizeColumnName": "some-string-that-is-hard-to-guess",
          "sourceVarName": "some-string-that-is-hard-to-guess",
          "startFromZero": false,
          "title": "some-string-that-is-hard-to-guess",
          "type": "plot",
          "xAxisLabel": "some-string-that-is-hard-to-guess",
          "xColumnName": "some-string-that-is-hard-to-guess",
          "yAxisLabel": "some-string-that-is-hard-to-guess",
          "yColumnChartTypes": [],
          "yColumnNames": [],
        },
      }
    `);
  });
});

describe('Default normalizer for every element', () => {
  it('inserts first missing node for single element', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        { type: ELEMENT_DATA_TAB_CHILDREN, children: [] } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "node": {
          "children": [
            {
              "text": "",
            },
          ],
          "id": "mocked-id",
          "type": "structured_varname",
        },
        "path": [
          0,
          0,
        ],
        "type": "insert_node",
      }
    `);
  });

  it('inserts first node if it is missing', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        {
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            { type: ELEMENT_CODE_LINE_V2_CODE, children: [{ text: 'code' }] },
          ],
        } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "node": {
          "children": [
            {
              "text": "",
            },
          ],
          "id": "mocked-id",
          "type": "structured_varname",
        },
        "path": [
          0,
          0,
        ],
        "type": "insert_node",
      }
    `);
  });

  it('moves nodes in place if they exist', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        {
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            { type: ELEMENT_CODE_LINE_V2_CODE, children: [{ text: 'code' }] },
            {
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: 'varname' }],
            },
          ],
        } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "newPath": [
          0,
          0,
        ],
        "path": [
          0,
          1,
        ],
        "type": "move_node",
      }
    `);
  });

  it('removes extra nodes', () => {
    expect(
      normalizeElement(ELEMENT_DATA_TAB_CHILDREN)([
        {
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            {
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: 'varname' }],
            },
            { type: ELEMENT_CODE_LINE_V2_CODE, children: [{ text: 'code' }] },
            {
              type: ELEMENT_CODE_LINE_V2_CODE,
              children: [{ text: 'extra-code' }],
            },
          ],
        } as any,
        [0],
      ])
    ).toMatchInlineSnapshot(`
      {
        "node": {
          "children": [
            {
              "text": "extra-code",
            },
          ],
          "type": "code_line_v2_code",
        },
        "path": [
          0,
          2,
        ],
        "type": "remove_node",
      }
    `);
  });
});

describe('Normalizes on an actual editor', () => {
  let editor = createEditor() as TEditor;

  beforeEach(() => {
    editor = createEditor() as TEditor;
  });

  it('normalizes workspace numbers', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_DATA_TAB_CHILDREN)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [],
      },
    ];

    editor.normalize();

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "mocked-id",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "mocked-id",
              "type": "code_line_v2_code",
            },
          ],
          "id": "mocked-id",
          "type": "data-tab-children",
        },
      ]
    `);
  });

  it('normalizes workspace numbers if elements are out of order', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_DATA_TAB_CHILDREN)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: 'code' }],
          },
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'varname' }],
          },
        ],
      },
    ];

    editor.normalize();

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "text": "varname",
                },
              ],
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "code",
                },
              ],
              "type": "code_line_v2_code",
            },
          ],
          "id": "mocked-id",
          "type": "data-tab-children",
        },
      ]
    `);
  });

  it('adds required element properties', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_PLOT)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_PLOT,
        children: [{ text: '' }],
      },
    ];

    editor.normalize();

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "arcVariant": "simple",
          "barVariant": "grouped",
          "children": [
            {
              "text": "",
            },
          ],
          "flipTable": false,
          "grid": false,
          "groupByX": false,
          "id": "mocked-id",
          "lineVariant": "area",
          "markType": "line",
          "mirrorYAxis": false,
          "orientation": "vertical",
          "schema": "jun-2024",
          "showDataLabel": false,
          "startFromZero": false,
          "type": "plot",
          "yColumnChartTypes": [],
          "yColumnNames": [],
        },
      ]
    `);
  });

  it('removes extra properties', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_PLOT)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_PLOT,
        children: [{ text: '' }],
        erronousProperty: 5,
      },
    ];

    editor.normalize();

    expect(editor.children[0].erronousProperty).toBeUndefined();

    expect(editor.children).toMatchInlineSnapshot(`
      [
        {
          "arcVariant": "simple",
          "barVariant": "grouped",
          "children": [
            {
              "text": "",
            },
          ],
          "flipTable": false,
          "grid": false,
          "groupByX": false,
          "id": "mocked-id",
          "lineVariant": "area",
          "markType": "line",
          "mirrorYAxis": false,
          "orientation": "vertical",
          "schema": "jun-2024",
          "showDataLabel": false,
          "startFromZero": false,
          "type": "plot",
          "yColumnChartTypes": [],
          "yColumnNames": [],
        },
      ]
    `);
  });

  it('doesnt change a normal element', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_PLOT)(editor),
    ]);

    const goodPlot: PlotElement = {
      arcVariant: 'simple',
      barVariant: 'grouped',
      children: [
        {
          text: '',
        },
      ],
      flipTable: true,
      grid: true,
      groupByX: true,
      id: 'my_id',
      lineVariant: 'area',
      markType: 'line',
      mirrorYAxis: false,
      orientation: 'vertical',
      schema: 'jun-2024',
      showDataLabel: false,
      startFromZero: false,
      type: 'plot',
      yColumnChartTypes: [],
      yColumnNames: ['my', 'names'],
    };

    editor.children = [goodPlot];

    editor.normalize();

    expect(editor.children[0]).toEqual(goodPlot);
  });

  it('distinguishes between array and object', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_PLOT)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_PLOT,
        children: [{ text: '' }],
        yColumnNames: {},
      },
    ];

    editor.normalize();

    expect(editor.children[0].yColumnNames).toBeInstanceOf(Array);
  });

  it('allows optional types to remain', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_PLOT)(editor),
    ]);

    editor.children = [
      {
        type: ELEMENT_PLOT,
        children: [{ text: '' }],
        title: 'title',
      },
    ];

    editor.normalize();

    expect(editor.children[0].title).toBe('title');
  });

  it('doesnt break old charts', () => {
    editor.normalize = normalizeCurried(editor, [
      createNormalizer(ELEMENT_PLOT)(editor),
    ]);

    editor.children = [
      {
        id: 'plot_id',
        type: ELEMENT_PLOT,
        children: [
          {
            text: '',
          },
        ],
        title: 'Table 9 Bar Simple',
        sourceVarName: 'exprRef_JUmkupotEfOVRJ3mrWagC',
        xColumnName: 'Column1',
        yColumnName: 'Column2',
        markType: 'bar',
        thetaColumnName: '',
        sizeColumnName: '',
        colorColumnName: 'Column1',
        colorScheme: 'multicolor_yellow',
        y2ColumnName: 'Column3BigLabelSizeTestingColumn3BigLabelSizeTesting',
      },
    ];

    editor.normalize();

    expect(editor.children[0]).toMatchInlineSnapshot(`
      {
        "arcVariant": "simple",
        "barVariant": "grouped",
        "children": [
          {
            "text": "",
          },
        ],
        "colorScheme": "multicolor_yellow",
        "flipTable": false,
        "grid": false,
        "groupByX": false,
        "id": "plot_id",
        "lineVariant": "area",
        "markType": "bar",
        "mirrorYAxis": false,
        "orientation": "vertical",
        "schema": "jun-2024",
        "showDataLabel": false,
        "sizeColumnName": "",
        "sourceVarName": "exprRef_JUmkupotEfOVRJ3mrWagC",
        "startFromZero": false,
        "title": "Table 9 Bar Simple",
        "type": "plot",
        "xColumnName": "Column1",
        "yColumnChartTypes": [],
        "yColumnNames": [],
      }
    `);
  });
});
