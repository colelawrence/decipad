import { getRemoteComputer, materializeResult } from '@decipad/remote-computer';
import { outputResult } from './utils/outputResult';
import { ServerSideNotebookApi } from '../types';
import { CustomAction } from '@decipad/notebook-open-api';
import { z } from 'zod';

export const evalCode: CustomAction<
  Parameters<ServerSideNotebookApi['evalCode']>[0],
  ReturnType<ServerSideNotebookApi['evalCode']>
> = {
  summary: 'evaluates a snippet of decipad language code',
  response: {
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
  parameters: {
    code: {
      description: 'a bit of decipad language code',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  parameterSchema: () =>
    z.object({
      code: z.string(),
    }),
  requiresNotebook: false,
  requiresRootEditor: false,
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
