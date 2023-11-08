import { getNodeString, insertNodes, getNode } from '@udecode/plate';
import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';

export const appendCodeLine: Action<'appendCodeLine'> = {
  summary: 'appends a code line to the notebook',
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
            'the name of the variable to create. Should be unique and have no spaces or weird characters.',
          type: 'string',
        },
        codeExpression: {
          description: 'decipad language code expression for this variable',
          type: 'string',
        },
      },
      required: ['variableName', 'codeExpression'],
    },
  },
  validateParams: (params): params is ActionParams<'appendCodeLine'> =>
    typeof params.variableName === 'string' &&
    typeof params.codeExpression === 'string',
  handler: (editor, { variableName, codeExpression }) => {
    const newCodeLine: CodeLineV2Element = {
      type: ELEMENT_CODE_LINE_V2,
      id: nanoid(),
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          id: nanoid(),
          children: [
            {
              text: variableName,
            },
          ],
        },
        {
          type: ELEMENT_CODE_LINE_V2_CODE,
          id: nanoid(),
          children: [{ text: codeExpression }],
        },
      ],
    };

    const insertCodeLinePath = appendPath(editor);

    insertNodes(editor, [newCodeLine], { at: insertCodeLinePath });

    const actualElement = getDefined(
      getNode<CodeLineV2Element>(editor, insertCodeLinePath)
    );
    return {
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement.children[0]),
    };
  },
};
