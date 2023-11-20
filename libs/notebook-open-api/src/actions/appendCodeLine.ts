import { insertNodes, getNode, TPath } from '@udecode/plate';
import {
  type CodeLineV2Element,
  type CodeLineElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams, NotebookActionHandler } from './types';
import { appendPath } from '../utils/appendPath';
import {} from '../../../editor-types/src/value';
import { updateCodeLine } from './updateCodeLine';
import { findElementByVariableName } from './utils/findElementByVariableName';
import { notAcceptable } from '@hapi/boom';
import { getNodeString } from '../utils/getNodeString';

export const appendCodeLine: Action<'appendCodeLine'> = {
  summary: 'appends a code line to the notebook',
  parameters: {
    variableName: {
      description:
        'the name of the variable to create. Should be unique and have no spaces or weird characters.',
      required: true,
      schema: {
        type: 'string',
      },
    },
    codeExpression: {
      description: 'decipad language code expression for this variable',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  response: {
    schemaName: 'CreateResult',
  },
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  validateParams: (params): params is ActionParams<'appendCodeLine'> =>
    typeof params.variableName === 'string' &&
    typeof params.codeExpression === 'string',
  handler: async (editor, { variableName, codeExpression }) => {
    const alreadyHasElementEntry = findElementByVariableName(
      editor,
      variableName
    );
    let codeLinePath: TPath;
    if (alreadyHasElementEntry) {
      // element with var name already exists
      const [alreadyHasElement, alreadyHasElementEntryPath] =
        alreadyHasElementEntry;
      if (
        alreadyHasElement.type !== ELEMENT_CODE_LINE_V2 &&
        alreadyHasElement.type !== ELEMENT_CODE_LINE
      ) {
        throw notAcceptable(
          `A ${alreadyHasElement.type} element with that variable name already exists`
        );
      }
      codeLinePath = alreadyHasElementEntryPath;
      await (updateCodeLine.handler as NotebookActionHandler)(editor, {
        codeLineId: alreadyHasElement.id,
        newVariableName: variableName,
        newCodeExpression: codeExpression,
      });
    } else {
      let newCodeLine: CodeLineElement | CodeLineV2Element;
      if (codeExpression.replaceAll(' ', '').startsWith(`${variableName}=`)) {
        // looking at an advanced code block
        newCodeLine = {
          type: ELEMENT_CODE_LINE,
          id: nanoid(),
          children: [{ text: codeExpression }],
        };
      } else {
        newCodeLine = {
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
      }

      codeLinePath = appendPath(editor);

      insertNodes(editor, [newCodeLine], { at: codeLinePath });
    }

    const actualElement = getDefined(
      getNode<CodeLineV2Element>(editor, codeLinePath)
    );
    return {
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement.children[0]),
    };
  },
};
