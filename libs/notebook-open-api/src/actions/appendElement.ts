import { EElementOrText, insertNodes, isElement } from '@udecode/plate-common';
import { notAcceptable } from '@hapi/boom';
import { MyValue, topLevelBlockKinds } from '@decipad/editor-types';
import type { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';

export const appendElement: Action<'appendElement'> = {
  summary: 'Appends any element to the end of the notebook',
  parameters: {
    element: {
      description: 'the new element getting appended to the notebook',
      schema: {
        $ref: '#/components/schemas/AnyElement',
      },
      required: true,
    },
  },
  validateParams: (params): params is ActionParams<'appendElement'> =>
    isElement(params.element),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { element }) => {
    if (!isElement(element) || !topLevelBlockKinds.includes(element.type)) {
      throw notAcceptable('Invalid element');
    }
    insertNodes(editor, [element as EElementOrText<MyValue>], {
      at: appendPath(editor),
    });
  },
};
