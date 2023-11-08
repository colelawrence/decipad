import { deserializeMd, insertNodes, getNode } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { AnyElement, MyElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';
import { assertElementType } from '@decipad/editor-utils';

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
      const newElementPath = appendPath(editor);
      insertNodes(editor, [newElement], { at: newElementPath });
      const actualElement: MyElement | undefined = getDefined(
        getNode<MyElement>(editor, newElementPath)
      );
      assertElementType(actualElement, (element as AnyElement)?.type);
      response.push({
        createdElementId: actualElement.id,
        createdElementType: actualElement.type,
        createdElementName: actualElement.id,
      });
    }

    return response;
  },
};
