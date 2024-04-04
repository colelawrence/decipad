import type { ServerSideNotebookApi } from '../types';
import type { CustomAction } from '@decipad/notebook-open-api';
import { z } from 'zod';
import { searchTemplates } from '@decipad/backend-search';

export const searchForNotebookTemplates: CustomAction<
  Parameters<ServerSideNotebookApi['searchForNotebookTemplates']>[0],
  ReturnType<ServerSideNotebookApi['searchForNotebookTemplates']>
> = {
  summary: 'searches for notebook templates',
  response: {
    schema: {
      type: 'object',
      properties: {
        foundNotebookTemplates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              summary: {
                type: 'string',
              },
            },
            required: ['id', 'title'],
          },
        },
      },
    },
  },
  parameterSchema: () =>
    z.object({
      prompt: z.string().openapi({
        description: 'natural language description of the code to generate',
      }),
      maxResults: z.number().int().optional().openapi({
        description: 'maximum number of results to return',
      }),
    }),
  requiresNotebook: false,
  requiresRootEditor: false,
  handler: async ({ prompt, maxResults = 5 }) => {
    const searchResults = await searchTemplates(prompt, { maxResults });
    return {
      foundNotebookTemplates: searchResults.map((result) => ({
        id: result.notebook.id,
        title: result.notebook.name,
        summary: result.summary,
      })),
    };
  },
};
