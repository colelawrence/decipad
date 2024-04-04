import type { TPath } from '@udecode/plate-common';
import { insertNodes, getNode } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { notAcceptable } from '@hapi/boom';
import {
  type CodeLineV2Element,
  type CodeLineElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { extendZodWithOpenApi } from 'zod-openapi';

import type { Action, NotebookActionHandler } from './types';
import { appendPath } from '../utils/appendPath';
import {} from '../../../editor-types/src/value';
import { updateCodeLine } from './updateCodeLine';
import { findElementByVariableName } from './utils/findElementByVariableName';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const appendCodeLine: Action<'appendCodeLine'> = {
  summary: 'appends a code line to the notebook',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  parameterSchema: () =>
    z.object({
      variableName: z.string().openapi({
        description:
          'the name of the variable to create. Should be unique and have no spaces or weird characters.',
      }),
      codeExpression: z.string().openapi({
        description: 'decipad language code expression for this variable',
      }),
    }),
  handler: async (editor, { variableName, codeExpression }, context) => {
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
      await (updateCodeLine.handler as NotebookActionHandler)(
        editor,
        {
          codeLineId: alreadyHasElement.id,
          newVariableName: variableName,
          newCodeExpression: codeExpression,
        },
        context
      );
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
      summary: `Added a new expression with name "${variableName}"`,
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement.children[0]),
    };
  },
};
