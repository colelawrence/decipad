import { EElementOrText, insertNodes, isElement } from '@udecode/plate';
import { notAcceptable } from '@hapi/boom';
import { topLevelBlockKinds, MyValue } from '@decipad/editor-types';
import type { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';

export const appendElement: Action<'appendElement'> = {
  summary: 'Appends any element to the end of the notebook',
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        element: {
          $ref: '#/components/schemas/AnyElement',
        },
      },
      required: ['element'],
    },
  },
  parameters: [],
  validateParams: (params): params is ActionParams<'appendElement'> =>
    isElement(params.element),
  responses: {
    '200': {
      description: 'OK',
    },
  },
  requiresNotebook: true,
  handler: (editor, { element }) => {
    if (!isElement(element) || !topLevelBlockKinds.includes(element.type)) {
      throw notAcceptable('Invalid element');
    }
    insertNodes(editor, [element as EElementOrText<MyValue>], {
      at: appendPath(editor),
    });
  },
};
