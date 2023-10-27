import { deserializeMd, insertNodes } from '@udecode/plate';
import { Action, ActionParams } from './types';
import { MyElement } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { appendPath } from '../utils/appendPath';

export const appendText: Action<'appendText'> = {
  summary: 'Appends markdown text to the end of the notebook',
  description:
    'splits the markdown into separate elements and inserts them one at a time in the notebook',
  parameters: [],
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        markdownText: {
          description: 'the name of the table you want to append',
          type: 'string',
        },
      },
      required: ['markdownText'],
    },
  },
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResults',
    },
  },
  validateParams: (params): params is ActionParams<'appendText'> =>
    typeof params.markdownText === 'string',
  requiresNotebook: true,
  handler: (editor, { markdownText }) => {
    const tree = deserializeMd(editor, markdownText) as MyElement[];

    if (!Array.isArray(tree)) {
      throw new Error('Expected tree to be array');
    }

    const response = [];

    for (const element of tree) {
      const newElement = {
        ...element,
        id: nanoid(),
      };
      insertNodes(editor, [newElement], { at: appendPath(editor) });
      response.push({
        createdElementId: newElement.id,
        createdElementType: newElement.type,
        createdElementName: newElement.id,
      });
    }

    return response;
  },
};
