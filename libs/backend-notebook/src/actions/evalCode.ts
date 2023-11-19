import { outputResult } from '../utils/outputResult';
import type { Action, ActionParams } from './types';
import { getRemoteComputer, materializeResult } from '@decipad/remote-computer';

export const evalCode: Action<'evalCode'> = {
  summary: 'evaluates a snippet of decipad language code',
  responses: {
    '200': {
      description: 'OK',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
          errorLocation: {
            type: 'object',
            properties: {
              line: {
                type: 'number',
              },
              column: {
                type: 'number',
              },
            },
          },
          result: {
            type: 'object',
            properties: {
              type: {
                type: 'object',
              },
              value: {
                type: 'object',
              },
            },
          },
        },
      },
    },
  },
  parameters: [],
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        code: {
          description: 'a bit of decipad language code',
          type: 'string',
        },
      },
      required: ['code'],
    },
  },
  validateParams: (params): params is ActionParams<'evalCode'> =>
    typeof params.code === 'string',
  requiresNotebook: false,
  handler: async ({ code }) => {
    const computer = getRemoteComputer();

    return new Promise((resolve) => {
      const sub = computer
        .blockResultFromText$(code)
        .subscribe(async (result) => {
          sub.unsubscribe();
          const materializedResult = await materializeResult(result);
          resolve(outputResult(materializedResult));
        });
    });
  },
};
