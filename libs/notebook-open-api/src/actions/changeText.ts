import {
  EElement,
  findNode,
  isElement,
  TNodeEntry,
} from '@udecode/plate-common';
import { z } from 'zod';
import { notAcceptable, notFound } from '@hapi/boom';
import { MyValue } from '@decipad/editor-types';
import { matchElementId } from '../utils/matchElementId';
import { Action } from './types';
import { replaceText } from './utils/replaceText';

export const changeText: Action<'changeText'> = {
  summary: 'Changes the text in a text element',
  parameters: {
    elementId: {
      description: 'the id of the text element you want to change',
      required: true,
      schema: {
        type: 'string',
      },
    },
    newText: {
      description: 'the new content of the text element',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  parameterSchema: () =>
    z.object({
      elementId: z.string(),
      newText: z.string(),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
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
