import { Action, ActionParams } from './types';
import { ELEMENT_TAB, ELEMENT_TITLE } from '@decipad/editor-types';
import { verbalizeDoc } from '@decipad/doc-verbalizer';

export const describeAllNotebookElements: Action<'describeAllNotebookElements'> =
  {
    summary: 'Retrieves a brief description of all notebook elements',
    responses: {
      '200': {
        description: 'OK',
        schema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
            },
          },
        },
      },
    },
    parameters: [],
    requiresNotebook: true,
    validateParams: (
      _params
    ): _params is ActionParams<'describeAllNotebookElements'> => true,
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
