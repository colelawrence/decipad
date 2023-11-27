import {
  EElement,
  findNode,
  isElement,
  TNodeEntry,
} from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { notAcceptable, notFound } from '@hapi/boom';
import { matchElementId } from '../utils/matchElementId';
import { Action } from './types';
import { replaceText } from './utils/replaceText';
import { MyValue } from '@decipad/editor-types';

extendZodWithOpenApi(z);

export const changeText: Action<'changeText'> = {
  summary: 'Changes the text in a text element',
  parameterSchema: () =>
    z.object({
      elementId: z.string().openapi({
        description: 'the id of the text element you want to change',
      }),
      newText: z
        .string()
        .openapi({ description: 'the new content of the text element' }),
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
