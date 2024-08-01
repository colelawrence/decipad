import { z } from 'zod';
import {
  ELEMENT_DATA_TAB,
  ELEMENT_TAB,
  ELEMENT_TITLE,
} from '@decipad/editor-types';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import type { Action } from './types';

export const describeAllNotebookElements: Action<'describeAllNotebookElements'> =
  {
    summary: 'Retrieves a brief description of all notebook elements',
    response: {
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            elementId: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            value: {
              type: 'string',
            },
          },
        },
      },
    },
    requiresNotebook: true,
    requiresRootEditor: false,
    parameterSchema: () => z.unknown(),
    handler: (editor) =>
      verbalizeDoc(
        {
          children: [
            {
              type: ELEMENT_TITLE,
              id: 'title-id',
              children: [{ text: 'Title' }],
            },
            {
              type: ELEMENT_DATA_TAB,
              id: 'data-tab-id',
              children: [],
            },
            {
              type: ELEMENT_TAB,
              id: 'tab-id',
              name: 'First tab',
              children: editor.children,
            },
          ],
        },
        getComputer()
      ).verbalized.map((v) => ({
        elementId: v.element.id ?? '',
        type: v.element.type,
        description: v.verbalized,
        value: v.value,
      })),
  };
