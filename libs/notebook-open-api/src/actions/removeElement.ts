import { removeNodes } from '@udecode/plate-common';
import { Action, ActionParams } from './types';
import { matchElementId } from '../utils/matchElementId';

export const removeElement: Action<'removeElement'> = {
  summary: 'removes an entire existing element from the notebook',
  parameters: {
    elementId: {
      description: 'the id of the element you want to remove',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  validateParams: (params): params is ActionParams<'removeElement'> =>
    typeof params.elementId === 'string',
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { elementId }) => {
    removeNodes(editor, { match: matchElementId(elementId as string) });
  },
};
