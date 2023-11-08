import { removeNodes } from '@udecode/plate';
import { Action, ActionParams } from './types';
import { matchElementId } from '../utils/matchElementId';

export const removeElement: Action<'removeElement'> = {
  summary: 'removes an entire existing element from the notebook',
  responses: {
    '200': {
      description: 'OK',
    },
  },
  parameters: [
    {
      name: 'elementId',
      in: 'query',
      description: 'the id of the element you want to remove',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  validateParams: (params): params is ActionParams<'removeElement'> =>
    typeof params.elementId === 'string',
  requiresNotebook: true,
  handler: (editor, { elementId }) => {
    removeNodes(editor, { match: matchElementId(elementId as string) });
  },
};
