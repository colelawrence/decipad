import { insertNodes, getNode } from '@udecode/plate-common';
import { z } from 'zod';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { VariableSliderElement } from '../../../editor-types/src/interactive-elements';
import { getNodeString } from '../utils/getNodeString';

export const appendSliderVariable: Action<'appendSliderVariable'> = {
  summary: 'appends a slider component',
  description:
    'appends a slider component into the notebook. The user will be able to change that value by playing with the slider. The value of the slider can be used in code using the given variable name.',
  parameters: {
    variableName: {
      description:
        'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
      required: true,
      schema: {
        type: 'string',
      },
    },
    initialValue: {
      description: 'the initial value for this slider',
      required: true,
      schema: {
        type: 'number',
      },
    },
    unit: {
      description:
        'the unit of the value. Can be something like "USD per month", "GBP", "bananas", "bananas per minute", etc.',
      required: false,
      schema: {
        type: 'string',
      },
    },
    min: {
      description: 'the minimum value this slider accepts',
      required: false,
      schema: {
        type: 'number',
      },
    },
    max: {
      description: 'the maximum value this slider accepts',
      required: false,
      schema: {
        type: 'number',
      },
    },
    step: {
      description: 'the step at which the user can change the value',
      required: false,
      schema: {
        type: 'number',
      },
    },
  },
  response: {
    schemaName: 'CreateResult',
  },
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  parameterSchema: () =>
    z.object({
      variableName: z.string(),
      initialValue: z.number(),
      unit: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
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
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement.children[0]),
    };
  },
};
