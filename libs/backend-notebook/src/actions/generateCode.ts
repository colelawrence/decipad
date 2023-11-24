import {
  ELEMENT_TAB,
  ELEMENT_TITLE,
  RootDocument,
} from '@decipad/editor-types';
import { codeAssistant } from '@decipad/backend-code-assistant';
import { notImplemented } from '@hapi/boom';
import { nanoid } from 'nanoid';
import { ServerSideNotebookApi } from '../types';
import { CustomAction } from '@decipad/notebook-open-api';
import { z } from 'zod';

export const generateCode: CustomAction<
  Parameters<ServerSideNotebookApi['generateCode']>[0],
  ReturnType<ServerSideNotebookApi['generateCode']>
> = {
  summary: 'generates Decipad language code from a prompt',
  response: {
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
        },
        errorLocation: {
          type: 'object',
          properties: {
            line: {
              type: 'number',
            },
            column: {
              type: 'number',
            },
          },
        },
        blocks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['expression', 'assignment'],
              },
              expressionCode: {
                type: 'string',
              },
              varname: {
                type: 'string',
              },
              value: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  parameters: {
    prompt: {
      description: 'natural language description of the code to generate',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  parameterSchema: () =>
    z.object({
      prompt: z.string(),
    }),
  requiresNotebook: true,
  handler: async (editor, { prompt }) => {
    // code assistant works with the root document, so we have to
    // pass a fake one in
    const rootDocument: RootDocument = {
      children: [
        {
          type: ELEMENT_TITLE,
          id: nanoid(),
          children: [{ text: 'Title' }],
        },
        {
          type: ELEMENT_TAB,
          id: nanoid(),
          name: 'First tab',
          children: editor.children,
        },
      ],
    };
    const result = await codeAssistant({ notebook: rootDocument, prompt });
    if (!result) {
      throw notImplemented('Could not generate code from the given prompt');
    }
    return result;
  },
};
