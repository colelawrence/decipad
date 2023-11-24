import { z } from 'zod';
import { ELEMENT_TAB, ELEMENT_TITLE } from '@decipad/editor-types';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { Action } from './types';

export const describeAllNotebookElements: Action<'describeAllNotebookElements'> =
  {
    summary: 'Retrieves a brief description of all notebook elements',
    response: {
      schema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
          },
        },
      },
    },
    parameters: {},
    requiresNotebook: true,
    parameterSchema: () => z.unknown(),
    handler: (editor) =>
      verbalizeDoc({
        children: [
          {
            type: ELEMENT_TITLE,
            id: 'title-id',
            children: [{ text: 'Title' }],
          },
          {
            type: ELEMENT_TAB,
            id: 'tab-id',
            name: 'First tab',
            children: editor.children,
          },
        ],
      }).verbalized.map((v) => ({
        elementId: v.element.id,
        description: v.verbalized,
      })),
  };
