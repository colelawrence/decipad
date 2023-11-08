import { findNode, isElement, EElement, TNodeEntry } from '@udecode/plate';
import { notAcceptable, notFound } from '@hapi/boom';
import { matchElementId } from '../utils/matchElementId';
import { Action, ActionParams } from './types';
import { replaceText } from './utils/replaceText';
import { MyValue } from '@decipad/editor-types';

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
    const [node, path] = entry;
    if (!isElement(node)) {
      throw notAcceptable(`node with id ${elementId} is not an element`);
    }
    replaceText(editor, [node, path] as TNodeEntry<EElement<MyValue>>, newText);
  },
};
