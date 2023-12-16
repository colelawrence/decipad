import { EElementOrText, insertNodes, isElement } from '@udecode/plate-common';
import { notAcceptable } from '@hapi/boom';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { MyValue, topLevelBlockKinds } from '@decipad/editor-types';
import type { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { anyElement } from './schemas/anyElement';

extendZodWithOpenApi(z);

export const appendElement: Action<'appendElement'> = {
  summary: 'Appends any element to the end of the notebook',
  parameterSchema: () =>
    z.object({
      element: anyElement().openapi({
        description: 'the new element getting appended to the notebook',
      }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { element }) => {
    if (!isElement(element) || !topLevelBlockKinds.includes(element.type)) {
      throw notAcceptable('Invalid element');
    }
    insertNodes(editor, [element as EElementOrText<MyValue>], {
      at: appendPath(editor),
    });

    return {
      summary: `Added a new ${element.type}`,
    };
  },
};
