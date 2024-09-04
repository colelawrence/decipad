import { expect, describe, it } from 'vitest';
import { createMyPlateEditor } from '@decipad/editor-types';
import { createMigratePlotPlugin } from './createMigratePlot';

const editor = createMyPlateEditor({
  plugins: [createMigratePlotPlugin()],
});

describe('spec tests', () => {
  it('migrates old plot to new spec', () => {
    editor.children = [
      {
        children: [
          {
            text: '',
          },
        ],
        id: 'ES7z17-Msh_R0aJZmZmFP',
        type: 'plot',
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
      } as any,
    ];

    editor.normalize({ force: true });

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
          "colorColumnName": "Column1",
          "colorScheme": "multicolor_yellow",
          "flipTable": false,
          "grid": true,
          "groupByX": true,
          "id": "ES7z17-Msh_R0aJZmZmFP",
          "lineVariant": "simple",
          "markType": "bar",
          "mirrorYAxis": false,
          "orientation": "horizontal",
          "schema": "jun-2024",
          "showDataLabel": false,
          "sizeColumnName": "",
          "sourceVarName": "exprRef_JUmkupotEfOVRJ3mrWagC",
          "startFromZero": true,
          "thetaColumnName": "",
          "title": "Table 9 Bar Simple",
          "type": "plot",
          "xColumnName": "Column1",
          "y2ColumnName": "Column3BigLabelSizeTestingColumn3BigLabelSizeTesting",
          "yColumnChartTypes": [],
          "yColumnName": "Column2",
          "yColumnNames": [
            "Column2",
            "Column3BigLabelSizeTestingColumn3BigLabelSizeTesting",
          ],
        },
      ]
    `);
  });

  it('simple-monthly-revenue-report', () => {
    editor.children = [
      {
        children: [
          {
            text: '',
          },
        ],
        id: 'CDTeCltdYDmDGLJPCqsBC',
        type: 'plot',
        title: 'Revenue By Month',
        sourceVarName: 'exprRef_IznRNH9oWPzprLcHSSw7y',
        xColumnName: 'Date',
        yColumnName: 'Revenue',
        markType: 'bar',
        thetaColumnName: '',
        sizeColumnName: '',
        colorColumnName: 'Date',
        y2ColumnName: 'None',
        colorScheme: 'multicolor_orange',
      } as any,
    ];

    editor.normalize({ force: true });

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
          "colorColumnName": "Date",
          "colorScheme": "multicolor_orange",
          "flipTable": false,
          "grid": true,
          "groupByX": true,
          "id": "CDTeCltdYDmDGLJPCqsBC",
          "lineVariant": "simple",
          "markType": "bar",
          "mirrorYAxis": false,
          "orientation": "horizontal",
          "schema": "jun-2024",
          "showDataLabel": false,
          "sizeColumnName": "",
          "sourceVarName": "exprRef_IznRNH9oWPzprLcHSSw7y",
          "startFromZero": true,
          "thetaColumnName": "",
          "title": "Revenue By Month",
          "type": "plot",
          "xColumnName": "Date",
          "y2ColumnName": "None",
          "yColumnChartTypes": [],
          "yColumnName": "Revenue",
          "yColumnNames": [
            "Revenue",
          ],
        },
      ]
    `);
  });

  it('meet Decipad! Learn the basics', () => {
    editor.children = [
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'plot',
        title: 'Chart',
        sourceVarName: 'Routes',
        xColumnName: 'Name',
        yColumnName: 'Distance',
        markType: 'bar',
        thetaColumnName: '',
        sizeColumnName: '',
        colorColumnName: 'Name',
        colorScheme: '',
      } as any,
    ];

    editor.normalize({ force: true });

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
          "colorColumnName": "Name",
          "colorScheme": "monochrome_gray",
          "flipTable": false,
          "grid": true,
          "groupByX": true,
          "lineVariant": "simple",
          "markType": "bar",
          "mirrorYAxis": false,
          "orientation": "horizontal",
          "schema": "jun-2024",
          "showDataLabel": false,
          "sizeColumnName": "",
          "sourceVarName": "Routes",
          "startFromZero": true,
          "thetaColumnName": "",
          "title": "Chart",
          "type": "plot",
          "xColumnName": "Name",
          "yColumnChartTypes": [],
          "yColumnName": "Distance",
          "yColumnNames": [
            "Distance",
          ],
        },
      ]
    `);
  });

  it('finance tracker 2023 bar chart', () => {
    editor.children = [
      {
        children: [
          {
            text: '',
          },
        ],
        id: 'LrWqU0eLVy9qZLH1kNCzX',
        type: 'plot',
        title: 'Money Spent each Month',
        sourceVarName: 'exprRef_QTF7OPDR0rb6H_bOyAbJm',
        xColumnName: 'Month',
        yColumnName: 'Expenses',
        markType: 'bar',
        thetaColumnName: 'Expenses',
        sizeColumnName: '',
        colorColumnName: 'Type',
        colorScheme: 'monochrome_purple',
        y2ColumnName: 'Cashflow',
      } as any,
    ];

    editor.normalize({ force: true });

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
          "colorColumnName": "Type",
          "colorScheme": "monochrome_purple",
          "flipTable": false,
          "grid": true,
          "groupByX": true,
          "id": "LrWqU0eLVy9qZLH1kNCzX",
          "lineVariant": "simple",
          "markType": "bar",
          "mirrorYAxis": false,
          "orientation": "horizontal",
          "schema": "jun-2024",
          "showDataLabel": false,
          "sizeColumnName": "",
          "sourceVarName": "exprRef_QTF7OPDR0rb6H_bOyAbJm",
          "startFromZero": true,
          "thetaColumnName": "Expenses",
          "title": "Money Spent each Month",
          "type": "plot",
          "xColumnName": "Month",
          "y2ColumnName": "Cashflow",
          "yColumnChartTypes": [],
          "yColumnName": "Expenses",
          "yColumnNames": [
            "Expenses",
            "Cashflow",
          ],
        },
      ]
    `);
  });

  it('finance tracker 2023 pie chart', () => {
    editor.children = [
      {
        children: [
          {
            text: '',
          },
        ],
        id: 'GxpBCxtjTgsklLCod0RGn',
        type: 'plot',
        sizeColumnName: '',
        title: 'Money Spent in 2023 ',
        thetaColumnName: 'Expenses',
        sourceVarName: 'exprRef_QTF7OPDR0rb6H_bOyAbJm',
        colorScheme: 'monochrome_purple',
        xColumnName: 'Type',
        colorColumnName: 'Type',
        yColumnName: 'Amount',
        markType: 'arc',
        y2ColumnName: '',
      } as any,
    ];

    editor.normalize({ force: true });

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
          "colorColumnName": "Type",
          "colorScheme": "monochrome_purple",
          "flipTable": false,
          "grid": true,
          "groupByX": true,
          "id": "GxpBCxtjTgsklLCod0RGn",
          "lineVariant": "simple",
          "markType": "arc",
          "mirrorYAxis": false,
          "orientation": "horizontal",
          "schema": "jun-2024",
          "showDataLabel": false,
          "sizeColumnName": "",
          "sourceVarName": "exprRef_QTF7OPDR0rb6H_bOyAbJm",
          "startFromZero": true,
          "thetaColumnName": "Expenses",
          "title": "Money Spent in 2023 ",
          "type": "plot",
          "xColumnName": "Type",
          "y2ColumnName": "",
          "yColumnChartTypes": [],
          "yColumnName": "Amount",
          "yColumnNames": [
            "Amount",
          ],
        },
      ]
    `);
  });
});
