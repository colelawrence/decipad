import { getNodeString, insertNodes, getNode } from '@udecode/plate';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';
import { VariableSliderElement } from '../../../editor-types/src/interactive-elements';

export const appendSliderVariable: Action<'appendSliderVariable'> = {
  summary: 'appends a slider component',
  description:
    'appends a slider component into the notebook. The user will be able to change that value by playing with the slider. The value of the slider can be used in code using the given variable name.',
  parameters: [],
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  requiresNotebook: true,
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        variableName: {
          description:
            'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
          type: 'string',
        },
        initialValue: {
          description: 'the initial value for this slider',
          type: 'number',
        },
        min: {
          description: 'the minimum value this slider accepts',
          type: 'number',
        },
        max: {
          description: 'the maximum value this slider accepts',
          type: 'number',
        },
        step: {
          description: 'the step at which the user can change the value',
          type: 'number',
        },
      },
      required: ['variableName', 'initialValue'],
    },
  },
  validateParams: (params): params is ActionParams<'appendSliderVariable'> =>
    typeof params.variableName === 'string' &&
    typeof params.initialValue === 'number',
  handler: (
    editor,
    { variableName, min = 0, max = 100, initialValue, step = 1 }
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
              text: initialValue.toString(),
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
