import { removeNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import type { Action } from './types';
import { findElementById } from './utils/findElementById';
import { notFound } from '@hapi/boom';

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
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { elementId }) => {
    const entry = findElementById(editor, elementId);
    if (!entry) {
      throw notFound(`Element with id ${elementId} could not be found`);
    }
    removeNodes(editor, { at: entry[1] });

    return {
      summary: `Removed element of type ${entry[0].type} with id ${elementId}`,
    };
  },
};
