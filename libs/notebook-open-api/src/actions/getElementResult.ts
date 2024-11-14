import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import type { Action } from './types';
import { findElementByVariableName } from './utils/findElementByVariableName';
import { findElementById } from '@decipad/editor-utils';
import { notAcceptable, notFound } from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import { isElement } from '@udecode/plate-common';
import { formatResult } from '@decipad/format';
import { validateId } from './utils/validateId';

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
  requiresRootEditor: false,
  handler: (editor, { elementId, varName }, { computer }) => {
    if (!elementId && !varName) {
      throw notAcceptable('need either elementId or varName arguments');
    }
    if (elementId) validateId(elementId);
    const entry = elementId
      ? findElementById(editor, elementId, { block: true })
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
    return {
      summary: formatResult('en-US', result.result?.value, result.result?.type),
    };
  },
};
