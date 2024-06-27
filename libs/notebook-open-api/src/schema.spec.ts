import { getOpenApiSchema } from './schema';

it('tests every action', () => {
  expect(getOpenApiSchema(true)).toMatchInlineSnapshot(`
    [
      {
        "description": "Retrieves a brief description of all notebook elements",
        "name": "describeAllNotebookElements",
        "parameters": {},
      },
      {
        "description": "fetches the result of an element",
        "name": "getElementResult",
        "parameters": {
          "properties": {
            "elementId": {
              "description": "the id of the element you want to get the result for",
              "type": "string",
            },
            "varName": {
              "description": "the variable name you want to get the result for",
              "type": "string",
            },
          },
          "required": [
            "varName",
            "elementId",
          ],
          "type": "object",
        },
      },
      {
        "description": "fetches an element from the notebook with the given id",
        "name": "getElementById",
        "parameters": {
          "properties": {
            "elementId": {
              "description": "the id of the element you want to retrieve",
              "type": "string",
            },
          },
          "required": [
            "elementId",
          ],
          "type": "object",
        },
      },
      {
        "description": "removes an entire existing element from the notebook",
        "name": "removeElement",
        "parameters": {
          "properties": {
            "elementId": {
              "description": "the id of the element you want to remove",
              "type": "string",
            },
          },
          "required": [
            "elementId",
          ],
          "type": "object",
        },
      },
      {
        "description": "Appends markdown text to the end of the notebook",
        "name": "appendText",
        "parameters": {
          "properties": {
            "markdownText": {
              "description": "markdown text to add to the notebook",
              "type": "string",
            },
          },
          "required": [
            "markdownText",
          ],
          "type": "object",
        },
      },
      {
        "description": "Changes the text in a text element",
        "name": "changeText",
        "parameters": {
          "properties": {
            "elementId": {
              "description": "the id of the text element you want to change",
              "type": "string",
            },
            "newText": {
              "description": "the new content of the text element",
              "type": "string",
            },
          },
          "required": [
            "elementId",
            "newText",
          ],
          "type": "object",
        },
      },
      {
        "description": "Changes the title of the notebook",
        "name": "changeNotebookTitle",
        "parameters": {
          "properties": {
            "newTitle": {
              "description": "the new content of the notebook title",
              "type": "string",
            },
          },
          "required": [
            "newTitle",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a code line to the notebook",
        "name": "appendCodeLine",
        "parameters": {
          "properties": {
            "codeExpression": {
              "description": "decipad language code expression for this variable",
              "type": "string",
            },
            "variableName": {
              "description": "the name of the variable to create. Should be unique and have no spaces or weird characters.",
              "type": "string",
            },
          },
          "required": [
            "variableName",
            "codeExpression",
          ],
          "type": "object",
        },
      },
      {
        "description": "changes an existing code line in the notebook",
        "name": "updateCodeLine",
        "parameters": {
          "properties": {
            "codeLineId": {
              "description": "the id of the code line you need to change",
              "type": "string",
            },
            "newCodeExpression": {
              "description": "the new decipad language code expression for this variable",
              "type": "string",
            },
            "newVariableName": {
              "description": "the new variable name if it needs changing, or the current one.",
              "type": "string",
            },
          },
          "required": [
            "codeLineId",
            "newVariableName",
            "newCodeExpression",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends an empty table to the end of the notebook",
        "name": "appendEmptyTable",
        "parameters": {
          "properties": {
            "columnNames": {
              "description": "the names of the columns you want this table to have",
              "items": {
                "description": "Column name. Should have no spaces or special characters.",
                "type": "string",
              },
              "type": "array",
            },
            "rowCount": {
              "description": "the number of rows for this new table",
              "type": "integer",
            },
            "tableName": {
              "description": "the name of the table you want to append. Should have no spaces or special characters.",
              "type": "string",
            },
          },
          "required": [
            "tableName",
            "columnNames",
            "rowCount",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a filled table to the end of the notebook",
        "name": "appendFilledTable",
        "parameters": {
          "properties": {
            "columnNames": {
              "description": "the column names for the table",
              "items": {
                "description": "Column name. Should have no spaces or special characters.",
                "type": "string",
              },
              "type": "array",
            },
            "rowsData": {
              "description": "the data for each row in an array for each row.",
              "items": {
                "description": "the data for a row",
                "items": {
                  "type": "string",
                },
                "type": "array",
              },
              "type": "array",
            },
            "tableName": {
              "description": "the name of the table you want to append. Should have no spaces or special characters.",
              "type": "string",
            },
          },
          "required": [
            "tableName",
            "columnNames",
            "rowsData",
          ],
          "type": "object",
        },
      },
      {
        "description": "fills the table data",
        "name": "fillTable",
        "parameters": {
          "properties": {
            "rowsData": {
              "description": "the content of the table, row by row",
              "items": {
                "description": "a row of data",
                "items": {
                  "description": "a cell",
                  "type": "string",
                },
                "type": "array",
              },
              "type": "array",
            },
            "tableId": {
              "description": "the id of the table you want to fill",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "rowsData",
          ],
          "type": "object",
        },
      },
      {
        "description": "fills the data on a column of the given table",
        "name": "fillColumn",
        "parameters": {
          "properties": {
            "columnData": {
              "description": "the content of the column",
              "items": {
                "type": "string",
              },
              "type": "array",
            },
            "columnName": {
              "description": "the name of the column you want to fill",
              "type": "string",
            },
            "tableId": {
              "description": "the id of the table you want to fill",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "columnName",
            "columnData",
          ],
          "type": "object",
        },
      },
      {
        "description": "updates the data on a table row",
        "name": "fillRow",
        "parameters": {
          "properties": {
            "rowData": {
              "description": "the content of that row",
              "items": {
                "type": "string",
              },
              "type": "array",
            },
            "rowIndex": {
              "description": "the index of the row you want to change. starts at 0",
              "type": "integer",
            },
            "tableId": {
              "description": "the id of the table you want to append a new row into",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "rowIndex",
            "rowData",
          ],
          "type": "object",
        },
      },
      {
        "description": "inserts a column in an existing table and fills it",
        "name": "insertFilledTableColumn",
        "parameters": {
          "properties": {
            "cells": {
              "description": "the data for the column",
              "items": {
                "type": "string",
              },
              "type": "array",
            },
            "columnName": {
              "description": "the name of the column. Must contain no spaces or weird characters",
              "type": "string",
            },
            "tableId": {
              "description": "the id of the table element",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "columnName",
            "cells",
          ],
          "type": "object",
        },
      },
      {
        "description": "inserts a calculated column to an existing table",
        "name": "insertFormulaTableColumn",
        "parameters": {
          "properties": {
            "columnName": {
              "description": "the name of the new column. Must contain no spaces or weird characters",
              "type": "string",
            },
            "formula": {
              "description": "the Decipad language formula for this new column",
              "type": "string",
            },
            "tableId": {
              "description": "the id of the table element",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "columnName",
            "formula",
          ],
          "type": "object",
        },
      },
      {
        "description": "removes a column from a table",
        "name": "removeTableColumn",
        "parameters": {
          "properties": {
            "columnName": {
              "description": "the name of the new column you want to remove",
              "type": "string",
            },
            "tableId": {
              "description": "the id of the table you want to remove a column from",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "columnName",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a row to the end of an existing table",
        "name": "insertTableRow",
        "parameters": {
          "properties": {
            "row": {
              "description": "the content of that row",
              "items": {
                "type": "string",
              },
              "type": "array",
            },
            "tableId": {
              "description": "the id of the table you want to append a new row into",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "row",
          ],
          "type": "object",
        },
      },
      {
        "description": "removes a row from a table",
        "name": "removeTableRow",
        "parameters": {
          "properties": {
            "rowIndex": {
              "description": "the index of the row you want to remove. starts at 0",
              "type": "integer",
            },
            "tableId": {
              "description": "the id of the table you want to insert remove a row from",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "rowIndex",
          ],
          "type": "object",
        },
      },
      {
        "description": "updates the content of a cell on a table",
        "name": "updateTableCell",
        "parameters": {
          "properties": {
            "columnName": {
              "description": "the name of the column you want to change",
              "type": "string",
            },
            "newCellContent": {
              "description": "the new content of the cell",
              "type": "string",
            },
            "rowIndex": {
              "description": "the index of the row you want to change. starts at 0",
              "type": "integer",
            },
            "tableId": {
              "description": "the id of the table you want to change",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "columnName",
            "rowIndex",
            "newCellContent",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a data view (pivot table) that summarizes and analyzes the data on a given table",
        "name": "appendDataView",
        "parameters": {
          "properties": {
            "columns": {
              "description": "the columns from the table you want to use to the data view",
              "items": {
                "properties": {
                  "aggregation": {
                    "description": "Aggregates the data from the column",
                    "enum": [
                      "average",
                      "max",
                      "median",
                      "min",
                      "span",
                      "sum",
                      "stddev",
                    ],
                    "type": "string",
                  },
                  "name": {
                    "description": "Column name",
                    "type": "string",
                  },
                  "round": {
                    "description": "Optional. The number of decimal places it rounds to. Use negative numbers to round to decimal points. Example: to round to the thousanth use "-3". When using dates you can round to "quarter", "year", "month" or "day"",
                    "type": "string",
                  },
                },
                "required": [
                  "name",
                ],
                "type": "object",
              },
              "type": "array",
            },
            "tableId": {
              "description": "the id of the table you want to use in the data view",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "columns",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a slider component",
        "name": "appendSliderVariable",
        "parameters": {
          "properties": {
            "initialValue": {
              "description": "the initial value for this slider",
              "type": "number",
            },
            "max": {
              "description": "the maximum value this slider accepts",
              "type": "number",
            },
            "min": {
              "description": "the minimum value this slider accepts",
              "type": "number",
            },
            "step": {
              "description": "the step at which the user can change the value",
              "type": "number",
            },
            "unit": {
              "description": "the unit of the value. Can be something like "USD per month", "GBP", "bananas", "bananas per minute", etc.",
              "type": "string",
            },
            "variableName": {
              "description": "the name of the variable for this slider. Should be unique and have no spaces or weird characters.",
              "type": "string",
            },
          },
          "required": [
            "variableName",
            "initialValue",
          ],
          "type": "object",
        },
      },
      {
        "description": "changes a slider component",
        "name": "updateSliderVariable",
        "parameters": {
          "properties": {
            "elementId": {
              "description": "the id of the slider element to change",
              "type": "string",
            },
            "max": {
              "description": "the new maximum value this slider accepts",
              "type": "number",
            },
            "min": {
              "description": "the new minimum value this slider accepts",
              "type": "number",
            },
            "step": {
              "description": "the new step at which the user can change the value",
              "type": "number",
            },
            "unit": {
              "description": "the new unit of the value",
              "type": "string",
            },
            "value": {
              "description": "the new value for this slider",
              "type": "number",
            },
            "variableName": {
              "description": "the new name of the variable for this slider. Should be unique and have no spaces or weird characters.",
              "type": "string",
            },
          },
          "required": [
            "value",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a plot (or graph) to the notebook",
        "name": "appendPlot",
        "parameters": {
          "properties": {
            "plotParams": {
              "description": "parameters for the plot",
              "properties": {
                "arcVariant": {
                  "type": "string",
                },
                "barVariant": {
                  "type": "string",
                },
                "flipTable": {
                  "type": "boolean",
                },
                "grid": {
                  "type": "boolean",
                },
                "groupByX": {
                  "type": "boolean",
                },
                "labelColumnName": {
                  "type": "string",
                },
                "lineVariant": {
                  "type": "string",
                },
                "mirrorYAxis": {
                  "type": "boolean",
                },
                "orientation": {
                  "type": "string",
                },
                "plotType": {
                  "enum": [
                    "bar",
                    "circle",
                    "square",
                    "tick",
                    "line",
                    "area",
                    "point",
                    "arc",
                  ],
                  "type": "string",
                },
                "showDataLabel": {
                  "type": "boolean",
                },
                "sizeColumnName": {
                  "type": "string",
                },
                "startFromZero": {
                  "type": "boolean",
                },
                "xAxisLabel": {
                  "type": "string",
                },
                "xColumnName": {
                  "type": "string",
                },
                "yAxisLabel": {
                  "type": "string",
                },
                "yColumnChartTypes": {
                  "items": {
                    "type": "string",
                  },
                  "type": "array",
                },
                "yColumnNames": {
                  "items": {
                    "type": "string",
                  },
                  "type": "array",
                },
              },
              "required": [
                "plotType",
              ],
              "type": "object",
            },
            "tableId": {
              "description": "the id of the source table for this plot",
              "type": "string",
            },
          },
          "required": [
            "tableId",
            "plotParams",
          ],
          "type": "object",
        },
      },
      {
        "description": "changes some of the parameters for a plot",
        "name": "setPlotParams",
        "parameters": {
          "properties": {
            "newPlotParams": {
              "description": "the parameters to change on the plot. Only include those that need to change",
              "properties": {
                "arcVariant": {
                  "type": "string",
                },
                "barVariant": {
                  "type": "string",
                },
                "flipTable": {
                  "type": "boolean",
                },
                "grid": {
                  "type": "boolean",
                },
                "groupByX": {
                  "type": "boolean",
                },
                "labelColumnName": {
                  "type": "string",
                },
                "lineVariant": {
                  "type": "string",
                },
                "mirrorYAxis": {
                  "type": "boolean",
                },
                "orientation": {
                  "type": "string",
                },
                "plotType": {
                  "enum": [
                    "bar",
                    "circle",
                    "square",
                    "tick",
                    "line",
                    "area",
                    "point",
                    "arc",
                  ],
                  "type": "string",
                },
                "showDataLabel": {
                  "type": "boolean",
                },
                "sizeColumnName": {
                  "type": "string",
                },
                "startFromZero": {
                  "type": "boolean",
                },
                "xAxisLabel": {
                  "type": "string",
                },
                "xColumnName": {
                  "type": "string",
                },
                "yAxisLabel": {
                  "type": "string",
                },
                "yColumnChartTypes": {
                  "items": {
                    "type": "string",
                  },
                  "type": "array",
                },
                "yColumnNames": {
                  "items": {
                    "type": "string",
                  },
                  "type": "array",
                },
              },
              "required": [
                "plotType",
              ],
              "type": "object",
            },
            "polotId": {
              "description": "the id of the plot element to change",
              "type": "string",
            },
          },
          "required": [
            "polotId",
            "newPlotParams",
          ],
          "type": "object",
        },
      },
      {
        "description": "appends a selection box for the user to choose one value",
        "name": "appendChoice",
        "parameters": {
          "properties": {
            "options": {
              "description": "the options available for the user",
              "items": {
                "description": "one available option",
                "type": "string",
              },
              "type": "array",
            },
            "selectedName": {
              "description": "contains the initially selected name from the given options.",
              "type": "string",
            },
            "variableName": {
              "description": "the name of the variable for this slider. Should be unique and have no spaces or weird characters.",
              "type": "string",
            },
          },
          "required": [
            "variableName",
            "options",
          ],
          "type": "object",
        },
      },
    ]
  `);
});
