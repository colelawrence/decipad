import { insertNodes, getNode } from '@udecode/plate';
import {
  ELEMENT_CAPTION,
  ELEMENT_DROPDOWN,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';
import {
  VariableSliderElement,
  VariableDropdownElement,
} from '../../../editor-types/src/interactive-elements';
import { getNodeString } from '../utils/getNodeString';

export const appendChoice: Action<'appendChoice'> = {
  summary: 'appends a selection box for the user to choose one value',
  description:
    'appends a slider component into the notebook. The value of the selected option can be used in code using the given variable name.',
  parameters: {
    variableName: {
      description:
        'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
      required: true,
      schema: {
        type: 'string',
      },
    },
    options: {
      description: 'the options available for the user',
      required: true,
      schema: {
        type: 'array',
        items: {
          description: 'one available option.',
          type: 'string',
        },
      },
    },
    selectedName: {
      description:
        'contains the initially selected name from the given options.',
      required: false,
      schema: {
        type: 'string',
      },
    },
  },
  response: {
    schemaName: 'CreateResult',
  },
  requiresNotebook: true,
  validateParams: (params): params is ActionParams<'appendChoice'> =>
    typeof params.variableName === 'string' &&
    Array.isArray(params.options) &&
    params.options.every((param) => param != null && typeof param === 'string'),
  handler: (editor, { variableName, options, selectedName = '' }) => {
    const newDropdown: VariableDropdownElement = {
      type: ELEMENT_VARIABLE_DEF,
      variant: 'dropdown',
      id: nanoid(),
      coerceToType: {
        kind: 'string',
      },
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
          type: ELEMENT_DROPDOWN,
          id: nanoid(),
          options: options.map((option) => ({
            id: nanoid(),
            value: option,
          })),
          children: [
            {
              text: selectedName,
            },
          ],
        },
      ],
    };

    const insertPath = appendPath(editor);
    insertNodes(editor, [newDropdown], { at: insertPath });

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
