import { insertNodes, getNode } from '@udecode/plate-common';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import {
  ELEMENT_CAPTION,
  ELEMENT_DROPDOWN,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { extendZodWithOpenApi } from 'zod-openapi';

import type { Action } from './types';
import { appendPath } from '../utils/appendPath';
import type {
  VariableSliderElement,
  VariableDropdownElement,
} from '../../../editor-types/src/interactive-elements';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const appendChoice: Action<'appendChoice'> = {
  summary: 'appends a selection box for the user to choose one value',
  description:
    'appends a slider component into the notebook. The value of the selected option can be used in code using the given variable name.',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  requiresNotebook: true,
  requiresRootEditor: false,
  parameterSchema: () =>
    z.object({
      variableName: z.string().openapi({
        description:
          'the name of the variable for this slider. Should be unique and have no spaces or weird characters.',
      }),
      options: z
        .array(z.string().describe('one available option'))
        .openapi({ description: 'the options available for the user' }),
      selectedName: z.string().optional().openapi({
        description:
          'contains the initially selected name from the given options.',
      }),
    }),
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
      summary: `Added a new dropdown with name "${variableName}"`,
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement.children[0]),
    };
  },
};
