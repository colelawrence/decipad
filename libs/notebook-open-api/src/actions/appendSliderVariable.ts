import { insertNodes, getNode } from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import type { Action } from './types';
import { appendPath } from '../utils/appendPath';
import type { VariableSliderElement } from '../../../editor-types/src/interactive-elements';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const appendSliderVariable: Action<'appendSliderVariable'> = {
  summary: 'appends a slider component',
  description:
    'appends a slider component into the notebook. The user will be able to change that value by playing with the slider. The value of the slider can be used in code using the given variable name.',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  requiresRootEditor: false,
  parameterSchema: () =>
    z.object({
      variableName: z.string().openapi({
        description:
          'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
      }),
      initialValue: z
        .number()
        .openapi({ description: 'the initial value for this slider' }),
      unit: z.string().optional().openapi({
        description:
          'the unit of the value. Can be something like "USD per month", "GBP", "bananas", "bananas per minute", etc.',
      }),
      min: z
        .number()
        .optional()
        .openapi({ description: 'the minimum value this slider accepts' }),
      max: z
        .number()
        .optional()
        .openapi({ description: 'the maximum value this slider accepts' }),
      step: z.number().optional().openapi({
        description: 'the step at which the user can change the value',
      }),
    }),
  handler: (
    editor,
    { variableName, min = 0, max = 100, initialValue, step = 1, unit = '' }
  ) => {
    const newSlider: VariableSliderElement = {
      type: ELEMENT_VARIABLE_DEF,
      variant: 'slider',
      id: nanoid(),
      children: [
        {
          type: ELEMENT_CAPTION,
          id: nanoid(),
          children: [
            {
              text: variableName,
            },
          ],
        },
        {
          type: ELEMENT_EXPRESSION,
          id: nanoid(),
          children: [
            {
              text: `${initialValue.toString()} ${unit}`.trim(),
            },
          ],
        },
        {
          type: ELEMENT_SLIDER,
          id: nanoid(),
          min: min.toString(),
          max: max.toString(),
          step: step.toString(),
          value: initialValue.toString(),
          children: [{ text: '' }],
        },
      ],
    };

    const insertPath = appendPath(editor);
    insertNodes(editor, [newSlider], { at: insertPath });

    const actualElement = getDefined(
      getNode<VariableSliderElement>(editor, insertPath)
    );
    return {
      summary: `Added a new slider with name "${variableName}"`,
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement.children[0]),
    };
  },
};
