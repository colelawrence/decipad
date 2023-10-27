import { create as createNotebookRecord } from '@decipad/services/notebooks';
import { create as createNotebookContent } from '@decipad/services/pad-content';
import { app } from '@decipad/backend-config';
import { Action, ActionParams } from './types';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  NotebookValue,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import slug from 'slug';

export const createNotebook: Action<'createNotebook'> = {
  summary: 'removes an existing element from the notebook',
  responses: {
    '200': {
      description: 'OK',
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
  },
  parameters: [
    {
      name: 'title',
      in: 'query',
      description: 'the title of the notebook you want to create',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  validateParams: (params): params is ActionParams<'createNotebook'> =>
    typeof params.title === 'string',
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
