import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import type { Action } from './types';
import { getElementById as getElementById2 } from './utils/getElementById';

extendZodWithOpenApi(z);

export const getElementById: Action<'getElementById'> = {
  summary: 'fetches an element from the notebook with the given id',
  response: {
    schema: {
      ref: '#/components/schemas/AnyElement',
    },
  },
  parameterSchema: () =>
    z.object({
      elementId: z
        .string()
        .openapi({ description: 'the id of the element you want to retrieve' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  handler: (editor, { elementId }) => getElementById2(editor, elementId)[0],
};
