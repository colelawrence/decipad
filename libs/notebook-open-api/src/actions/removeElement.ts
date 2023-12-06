import { removeNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { Action } from './types';
import { matchElementId } from '../utils/matchElementId';

extendZodWithOpenApi(z);

export const removeElement: Action<'removeElement'> = {
  summary: 'removes an entire existing element from the notebook',
  parameterSchema: () =>
    z.object({
      elementId: z
        .string()
        .openapi({ description: 'the id of the element you want to remove' }),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { elementId }) => {
    removeNodes(editor, { match: matchElementId(elementId as string) });

    return {
      summary: `Removed element with id ${elementId}`,
    };
  },
};
