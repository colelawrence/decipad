import { Action, ActionParams } from './types';
import { getElementById as getElementById2 } from './utils/getElementById';

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
  handler: (editor, { elementId }) => getElementById2(editor, elementId)[0],
};
