import {
  ELEMENT_TAB,
  ELEMENT_TITLE,
  RootDocument,
} from '@decipad/editor-types';
import { codeAssistant } from '@decipad/backend-code-assistant';
import { Action, ActionParams } from './types';
import { notImplemented } from '@hapi/boom';
import { nanoid } from 'nanoid';

export const generateFormula: Action<'generateFormula'> = {
  summary: 'gnerates a Decipad language formula from a prompt',
  responses: {
    '200': {
      description: 'OK',
    },
  },
  parameters: [],
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        prompt: {
          description:
            'natural language description of the formula to generate',
          type: 'string',
        },
      },
      required: ['prompt'],
    },
  },
  validateParams: (params): params is ActionParams<'generateFormula'> =>
    typeof params.prompt === 'string',
  requiresNotebook: true,
  handler: async (editor, { prompt }) => {
    // code assistant works with the root document, so we have to
    // pass a fake one in
    const rootDocument: RootDocument = {
      children: [
        {
          type: ELEMENT_TITLE,
          id: nanoid(),
          children: [{ text: 'Title' }],
        },
        {
          type: ELEMENT_TAB,
          id: nanoid(),
          name: 'First tab',
          children: editor.children,
        },
      ],
    };
    const result = await codeAssistant({ notebook: rootDocument, prompt });
    if (!result) {
      throw notImplemented('Could not generate code from the given prompt');
    }
    return result;
  },
};
