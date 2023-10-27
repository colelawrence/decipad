import { findNode, isElement, insertText } from '@udecode/plate';
import { notAcceptable, notFound } from '@hapi/boom';
import { matchElementId } from '../utils/matchElementId';
import { Action, ActionParams } from './types';

export const changeText: Action<'changeText'> = {
  summary: 'Changes the text in a text element',
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
        elementId: {
          description: 'the id of the text element you want to change',
          type: 'string',
        },
        newText: {
          description: 'the new content of the text element',
          type: 'string',
        },
      },
      required: ['elementId', 'newText'],
    },
  },
  validateParams: (params): params is ActionParams<'changeText'> =>
    typeof params.elementId === 'string' && typeof params.newText === 'string',
  requiresNotebook: true,
  handler: (editor, { elementId, newText }) => {
    if (typeof elementId !== 'string') {
      throw notAcceptable('elementId should be a string');
    }
    if (typeof newText !== 'string') {
      throw notAcceptable('elementId should be a string');
    }
    const entry = findNode(editor, { match: matchElementId(elementId) });
    if (!entry) {
      throw notFound(`Could not find an element with id ${elementId}`);
    }
    if (!isElement(entry[0])) {
      throw notAcceptable(`node with id ${elementId} is not an element`);
    }
    insertText(editor, newText, { at: entry[1] });
  },
};
