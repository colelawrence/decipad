export const functions = [
  {
    name: 'add_variable',
    description:
      "Call this function if you want to add a single variable to the user's document",
    parameters: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'The label of the variable in PascalCase',
        },
        value: {
          type: 'string',
          description: 'The value of the variable',
        },
        unit: {
          type: 'string',
          description: 'The unit of the variable',
        },
      },
      required: ['label', 'value'],
    },
  },
  {
    name: 'add_calculation',
    description:
      "Call this function to add a basic mathematical calculation that can use variables to the user's document",
    parameters: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'The label of the calculation in PascalCase',
        },
        math_statement: {
          type: 'string',
          description:
            'The mathematical statement to calculate in Decipad language',
        },
      },
      required: ['label', 'math_statement'],
    },
  },
  {
    name: 'variable_to_input_widget',
    description:
      'Call this function to turn a variable into an input_widget that the user can adjust',
    parameters: {
      type: 'object',
      properties: {
        variable_name: {
          type: 'string',
          description: 'The name of the variable to turn into an input widget',
        },
      },
      required: ['variable_name'],
    },
  },
  {
    name: 'input_widget_to_slider',
    description:
      'Call this function to turn an input widget into a slider that the user can adjust',
    parameters: {
      type: 'object',
      properties: {
        variable_name: {
          type: 'string',
          description: 'The name of the input widget to turn into a slider',
        },
      },
      required: ['variable_name'],
    },
  },
  {
    name: 'upload_file_by_url',
    description: 'Call this function to upload a file from url',
    parameters: {
      type: 'object',
      properties: {
        file_type: {
          type: 'string',
          description: 'The type of the file',
        },
        url: {
          type: 'string',
          description: 'The url of the file',
        },
      },
      required: ['file_type', 'url'],
    },
  },
  {
    name: 'add_paragraph',
    description:
      "Call this function to add a paragraph of text to the user's document",
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to add to the document',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'add_table',
    description: "Call this function to add a table to the user's document",
    parameters: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'A name for the table',
        },
        columns: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'The th column names of the table',
        },
        rows: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          description:
            'The rows of the table, where each row is an array of column values',
        },
      },
      required: ['label', 'columns', 'rows'],
    },
  },
];
