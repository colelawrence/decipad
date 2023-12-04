import { create as createNotebookRecord } from '@decipad/services/notebooks';
import { create as createNotebookContent } from '@decipad/services/pad-content';
import { app } from '@decipad/backend-config';
import { CustomAction } from '@decipad/notebook-open-api';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  NotebookValue,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import slug from 'slug';
import { z } from 'zod';
import { ServerSideNotebookApi } from '../types';

export const createNotebook: CustomAction<
  Parameters<ServerSideNotebookApi['createNotebook']>[0],
  ReturnType<ServerSideNotebookApi['createNotebook']>
> = {
  summary: 'creates a notebook',
  parameters: {
    title: {
      description: 'the title of the notebook you want to create',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  response: {
    schema: {
      type: 'object',
      properties: {
        createdNotebookId: {
          type: 'string',
        },
        createdNotebookURL: {
          type: 'string',
        },
      },
    },
  },
  parameterSchema: () =>
    z.object({
      title: z.string(),
    }),
  requiresNotebook: false,
  handler: async ({ title }) => {
    const notebook = await createNotebookRecord(undefined, {
      name: title,
      isPublic: true,
      isPublicWritable: true,
    });
    await createNotebookContent<NotebookValue>(notebook.id, [
      {
        type: ELEMENT_TITLE,
        id: nanoid(),
        children: [{ text: title }],
      },
      {
        type: ELEMENT_TAB,
        id: nanoid(),
        name: 'First tab',
        children: [
          {
            type: ELEMENT_PARAGRAPH,
            id: nanoid(),
            children: [{ text: '' }],
          },
        ],
      },
    ]);

    return {
      createdNotebookId: notebook.id,
      createdNotebookURL: `${app().urlBase}/n/${encodeURIComponent(
        `${slug(title)}:${notebook.id}`
      )}`,
    };
  },
};
