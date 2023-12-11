import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { notAcceptable } from '@hapi/boom';
import { Action } from './types';

extendZodWithOpenApi(z);

export const changeNotebookTitle: Action<'changeNotebookTitle'> = {
  summary: 'Changes the title of the notebook',
  parameterSchema: () =>
    z.object({
      newTitle: z
        .string()
        .openapi({ description: 'the new content of the notebook title' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { newTitle }) => {
    if (typeof newTitle !== 'string') {
      throw notAcceptable('title should be a string');
    }

    editor.withoutNormalizing(() => {
      editor.apply({
        type: 'remove_text',
        offset: 0,
        text: editor.children[0].children[0].text,
        path: [0, 0],
      });
      editor.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 0,
        text: newTitle,
      });
    });

    return {
      summary: `Changed notebook title to "${newTitle}"`,
    };
  },
};
