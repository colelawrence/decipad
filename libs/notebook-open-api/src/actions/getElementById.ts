import { Action, ActionParams } from './types';
import { getElementById as getElementById2 } from './utils/getElementById';

export const getElementById: Action<'getElementById'> = {
  summary: 'fetches an element from the notebook with the given id',
  response: {
    schemaName: 'AnyElement',
  },
  parameters: {
    elementId: {
      description: 'the id of the element you want to retrieve',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  validateParams: (params): params is ActionParams<'getElementById'> =>
    typeof params.elementId === 'string',
  requiresNotebook: true,
  handler: (editor, { elementId }) => getElementById2(editor, elementId)[0],
};
