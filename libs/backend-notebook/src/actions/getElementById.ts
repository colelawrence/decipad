import { findNode } from '@udecode/plate';
import { notFound, notAcceptable } from '@hapi/boom';
import { AnyElement } from '@decipad/editor-types';
import { matchElementId } from '../utils/matchElementId';
import { Action, ActionParams } from './types';

export const getElementById: Action<'getElementById'> = {
  summary: 'fetches an element from the notebook with the given id',
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'AnyElement',
    },
  },
  parameters: [
    {
      name: 'elementId',
      in: 'query',
      description: 'the id of the element you want to retrieve',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  validateParams: (params): params is ActionParams<'getElementById'> =>
    typeof params.elementId === 'string',
  requiresNotebook: true,
  handler: (editor, { elementId }) => {
    if (typeof elementId !== 'string') {
      throw notAcceptable('elementId should be a string');
    }
    const node = findNode<AnyElement>(editor, {
      match: matchElementId(elementId),
    })?.[0];
    if (!node) {
      throw notFound(`Could not find an element with id ${elementId}`);
    }
    return node;
  },
};
