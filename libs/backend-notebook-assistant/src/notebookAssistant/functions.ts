// ! Temporary workaround while we figure out how to consistently generate the API schema
export const functions = [
  {
    name: 'removeElement',
    description: 'removes an entire existing element from the notebook',
    parameters: {
      type: 'object',
      properties: {
        elementId: {
          type: 'string',
          description: 'the id of the element you want to remove',
        },
      },
      required: ['elementId'],
    },
  },
  {
    name: 'appendText',
    description: 'Appends markdown text to the end of the notebook',
    parameters: {
      type: 'object',
      properties: {
        markdownText: {
          type: 'string',
          description: 'the markdown text you want to append',
        },
      },
      required: ['markdownText'],
    },
  },
  {
    name: 'changeText',
    description: 'Changes the text in a text element',
    parameters: {
      type: 'object',
      properties: {
        elementId: {
          type: 'string',
          description: 'the id of the text element you want to change',
        },
        newText: {
          type: 'string',
          description: 'the new content of the text element',
        },
      },
      required: ['elementId', 'newText'],
    },
  },
  {
    name: 'appendCodeLine',
    description: 'appends a code line to the notebook',
    parameters: {
      type: 'object',
      properties: {
        variableName: {
          type: 'string',
          description:
            'the name of the variable to create. Should be unique and have no spaces or weird characters.',
        },
        codeExpression: {
          type: 'string',
          description: 'decipad language code expression for this variable',
        },
      },
      required: ['variableName', 'codeExpression'],
    },
  },
  {
    name: 'updateCodeLine',
    description: 'changes an existing code line in the notebook',
    parameters: {
      type: 'object',
      properties: {
        codeLineId: {
          type: 'string',
          description: 'the id of the code line you need to change',
        },
        newVariableName: {
          type: 'string',
          description:
            'the new variable name if it needs changing, or the current one.',
        },
        newCodeExpression: {
          type: 'string',
          description:
            'the new decipad language code expression for this variable',
        },
      },
      required: ['codeLineId', 'newVariableName', 'newCodeExpression'],
    },
  },
  {
    name: 'turnCodeLineToInputWidget',
    description: 'creates input widget from a variable',
    parameters: {
      type: 'object',
      properties: {
        codeLineId: {
          type: 'string',
          description: 'the id of the code line you need to change',
        },
      },
      required: ['codeLineId'],
    },
  },
  {
    name: 'appendEmptyTable',
    description: 'appends an empty table to the end of the notebook',
    parameters: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description:
            'the name of the table you want to append. Should have no spaces or special characters.',
        },
        columnNames: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'Column name. Should have no spaces or special characters.',
          },
          description: 'the name of the table you want to append',
        },
        rowCount: {
          type: 'integer',
          description: 'the number of rows for this new table',
        },
      },
      required: ['tableName', 'columnNames', 'rowCount'],
    },
  },
  {
    name: 'appendFilledTable',
    description: 'appends a filled table to the end of the notebook',
    parameters: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description:
            'the name of the table you want to append. Should have no spaces or special characters.',
        },
        columnNames: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'Column name. Should have no spaces or special characters.',
          },
          description: 'the column names for the table',
        },
        rowsData: {
          type: 'array',
          items: {
            type: 'array',
            description: 'the data for a row',
            items: {
              type: 'string',
            },
          },
          description: 'the data for each row in an array for each row.',
        },
      },
      required: ['tableName', 'columnNames', 'rowsData'],
    },
  },
  {
    name: 'fillTable',
    description: 'fills the table data',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table you want to fill',
        },
        rowsData: {
          type: 'array',
          items: {
            description: 'a row of data',
            type: 'array',
            items: {
              description: 'a cell',
              type: 'string',
            },
          },
          description: 'the content of the table, row by row',
        },
      },
      required: ['tableId', 'rowsData'],
    },
  },
  {
    name: 'insertFilledTableColumn',
    description: 'inserts a column in an existing table and fills it',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table element',
        },
        columnName: {
          type: 'string',
          description:
            'the name of the column. Must contain no spaces or weird characters',
        },
        cells: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'the data for the column',
        },
      },
      required: ['tableId', 'columnName', 'cells'],
    },
  },
  {
    name: 'insertFormulaTableColumn',
    description: 'inserts a calculated column to an existing table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table element',
        },
        columnName: {
          type: 'string',
          description:
            'the name of the new column. Must contain no spaces or weird characters',
        },
        formula: {
          type: 'string',
          description: 'the Decipad language formula for this new column',
        },
      },
      required: ['tableId', 'columnName', 'formula'],
    },
  },
  {
    name: 'removeTableColumn',
    description: 'removes a column from a table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table you want to remove a column from',
        },
        columnName: {
          type: 'string',
          description: 'the name of the new column you want to remove',
        },
      },
      required: ['tableId', 'columnName'],
    },
  },
  {
    name: 'insertTableRow',
    description: 'appends a row to the end of an existing table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table you want to append a new row into',
        },
        row: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'the content of that row',
        },
      },
      required: ['tableId', 'row'],
    },
  },
  {
    name: 'removeTableRow',
    description: 'removes a row from a table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description:
            'the id of the table you want to insert remove a row from',
        },
        rowIndex: {
          type: 'number',
          description: 'the index of the row you want to remove. starts at 0',
        },
      },
      required: ['tableId', 'rowIndex'],
    },
  },
  {
    name: 'updateTableCell',
    description: 'updates the content of a cell on a table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table you want to change',
        },
        columnName: {
          type: 'string',
          description: 'the name of the column you want to change',
        },
        rowIndex: {
          type: 'integer',
          description: 'the index of the row you want to change. starts at 0',
        },
        newCellContent: {
          type: 'string',
          description: 'the new content of the cell',
        },
      },
      required: ['tableId', 'columnName', 'rowIndex', 'newCellContent'],
    },
  },
  {
    name: 'appendDataView',
    description:
      'appends a data view (pivot table) that summarizes and analyzes the data on a given table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table you want to use in the data view',
        },
        columns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Column name',
              },
              aggregation: {
                type: 'string',
                description: 'Optional. Aggregates the data from the column',
                enum: [
                  'average',
                  'max',
                  'median',
                  'min',
                  'span',
                  'sum',
                  'stddev',
                ],
              },
              round: {
                type: 'string',
                description:
                  'Optional. The number of decimal places it rounds to. Use negative numbers to round to decimal points. Example: to round to the thousanth use "-3". When using dates you can round to "quarter", "year", "month" or "day"',
              },
            },
          },
          description:
            'the columns from the table you want to use to the data view',
        },
      },
      required: ['tableId', 'columns'],
    },
  },
  {
    name: 'appendTimeSeries',
    description:
      'appends a time series (pivot table) that summarizes and analyzes the data on a given table',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the table you want to use in the time series',
        },
        columns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Column name',
              },
              aggregation: {
                type: 'string',
                description: 'Optional. Aggregates the data from the column',
                enum: [
                  'average',
                  'max',
                  'median',
                  'min',
                  'span',
                  'sum',
                  'stddev',
                ],
              },
              round: {
                type: 'string',
                description:
                  'Optional. The number of decimal places it rounds to. Use negative numbers to round to decimal points. Example: to round to the thousanth use "-3". When using dates you can round to "quarter", "year", "month" or "day"',
              },
            },
          },
          description:
            'the columns from the table you want to use to the time series',
        },
      },
      required: ['tableId', 'columns'],
    },
  },
  {
    name: 'appendSliderVariable',
    description: 'appends a slider component',
    parameters: {
      type: 'object',
      properties: {
        variableName: {
          type: 'string',
          description:
            'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
        },
        initialValue: {
          type: 'number',
          description: 'the initial value for this slider',
        },
        min: {
          type: 'number',
          description: 'the minimum value this slider accepts',
        },
        max: {
          type: 'number',
          description: 'the maximum value this slider accepts',
        },
        step: {
          type: 'number',
          description: 'the step at which the user can change the value',
        },
      },
      required: ['variableName', 'initialValue'],
    },
  },
  {
    name: 'appendPlot',
    description: 'appends a plot (or graph) to the notebook',
    parameters: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: 'the id of the source table for this plot',
        },
        plotParams: {
          type: 'object',
          description: 'parameters for the plot',
        },
      },
      required: ['tableId', 'plotParams'],
    },
  },
  {
    name: 'setPlotParams',
    description: 'changes some of the parameters for a plot',
    parameters: {
      type: 'object',
      properties: {
        plotId: {
          type: 'string',
          description: 'the id of the plot element to change',
        },
        newPlotParams: {
          type: 'object',
          description:
            'the parameters to change on the plot. Only include those that need to change',
        },
      },
      required: ['plotId', 'newPlotParams'],
    },
  },
  {
    name: 'appendChoice',
    description: 'appends a selection box for the user to choose one value',
    parameters: {
      type: 'object',
      properties: {
        variableName: {
          type: 'string',
          description:
            'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
        },
        options: {
          type: 'array',
          items: {
            description: 'one available option.',
            type: 'string',
          },
          description: 'the options available for the user',
        },
        selectedName: {
          type: 'string',
          description:
            'contains the initially selected name from the given options.',
        },
      },
      required: ['variableName', 'options'],
    },
  },
];
