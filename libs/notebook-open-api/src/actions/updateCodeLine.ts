import type { Path } from 'slate';
import type { TNodeEntry } from '@udecode/plate-common';
import { isElement, findNode, withoutNormalizing } from '@udecode/plate-common';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  type AnyElement,
} from '@decipad/editor-types';
import { notFound, notAcceptable } from '@hapi/boom';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import type { Action } from './types';
import { replaceText } from './utils/replaceText';
import type {
  StructuredVarnameElement,
  CodeLineV2ElementCode,
} from '../../../editor-types/src/value';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const updateCodeLine: Action<'updateCodeLine'> = {
  summary: 'changes an existing code line in the notebook',
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
      codeLineId: z
        .string()
        .openapi({ description: 'the id of the code line you need to change' }),
      newVariableName: z.string().openapi({
        description:
          'the new variable name if it needs changing, or the current one.',
      }),
      newCodeExpression: z.string().openapi({
        description:
          'the new decipad language code expression for this variable',
      }),
    }),
  handler: (editor, { codeLineId, newVariableName, newCodeExpression }) => {
    const entry = findNode<AnyElement>(editor, {
      match: { id: codeLineId },
      block: true,
    });
    if (!entry || !isElement(entry[0])) {
      throw notFound(`Could not find code line with id ${codeLineId}`);
    }
    const [codeLine, codeLinePath] = entry;
    if (
      codeLine.type !== ELEMENT_CODE_LINE_V2 &&
      codeLine.type !== ELEMENT_CODE_LINE
    ) {
      throw notAcceptable(`element with id ${codeLineId} is not a code line`);
    }

    if (codeLine.type === ELEMENT_CODE_LINE) {
      if (
        newCodeExpression.replaceAll(' ', '').startsWith(`${newVariableName}=`)
      ) {
        replaceText(editor, entry, newCodeExpression);
      } else
        replaceText(editor, entry, `${newVariableName} = ${newCodeExpression}`);
      return {
        summary: `Updated code line`,
      };
    }

    withoutNormalizing(editor, () => {
      if (getNodeString(codeLine.children[0]) !== newVariableName) {
        const varNamePath: Path = [...codeLinePath, 0];
        const varNameEntry: TNodeEntry<StructuredVarnameElement> = [
          codeLine.children[0],
          varNamePath,
        ];
        replaceText(editor, varNameEntry, newVariableName);
      }
      if (getNodeString(codeLine.children[1]) !== newCodeExpression) {
        const expressionPath = [...codeLinePath, 1];
        const expressionEntry: TNodeEntry<CodeLineV2ElementCode> = [
          codeLine.children[1],
          expressionPath,
        ];
        replaceText(editor, expressionEntry, newCodeExpression);
      }
    });

    return {
      summary: `Updated code line`,
    };
  },
};
