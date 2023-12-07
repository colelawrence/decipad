import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { Action } from './types';
import { findElementByVariableName } from './utils/findElementByVariableName';
import { findElementById } from './utils/findElementById';
import { notAcceptable, notFound } from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import { isElement } from '@udecode/plate-common';
import { formatResult } from '@decipad/format';

extendZodWithOpenApi(z);

export const getElementResult: Action<'getElementResult'> = {
  summary: 'fetches the result of an element',
  response: {
    schema: {
      type: 'string',
    },
  },
  parameterSchema: () =>
    z.object({
      varName: z.string().openapi({
        description: 'the variable name you want to get the result for',
      }),
      elementId: z.string().openapi({
        description: 'the id of the element you want to get the result for',
      }),
    }),
  requiresNotebook: true,
  handler: (editor, { elementId, varName }, { computer }) => {
    if (!elementId && !varName) {
      throw notAcceptable('need either elementId or varName arguments');
    }
    const entry = elementId
      ? findElementById(editor, elementId)
      : findElementByVariableName(
          editor,
          getDefined(varName, 'missing varName argument')
        );
    if (!entry) {
      throw notFound('Could not find such element');
    }

    const [element] = entry;
    if (!isElement(element)) {
      throw notFound('not an element');
    }
    const result = computer.getBlockIdResult(element.id);
    if (!result || !result.result) {
      throw notFound('no result');
    }
    return formatResult('en-US', result.result?.value, result.result?.type);
  },
};
