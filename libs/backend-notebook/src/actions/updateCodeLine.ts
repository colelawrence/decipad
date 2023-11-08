import {
  getNodeString,
  isElement,
  findNode,
  withoutNormalizing,
  TNodeEntry,
} from '@udecode/plate';
import { ELEMENT_CODE_LINE_V2, type AnyElement } from '@decipad/editor-types';
import { notFound, notAcceptable } from '@hapi/boom';
import type { Action, ActionParams } from './types';
import { matchElementId } from '../utils/matchElementId';
import { replaceText } from './utils/replaceText';
import { Path } from 'slate';
import {
  StructuredVarnameElement,
  CodeLineV2ElementCode,
} from '../../../editor-types/src/value';

export const updateCodeLine: Action<'updateCodeLine'> = {
  summary: 'changes an existing code line in the notebook',
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
        codeLineId: {
          description: 'the id of the code line you need to change',
          type: 'string',
        },
        newVariableName: {
          description:
            'the new variable name if it needs changing, or the current one.',
          type: 'string',
        },
        newCodeExpression: {
          description:
            'the new decipad language code expression for this variable',
          type: 'string',
        },
      },
      required: ['codeLineId', 'newVariableName', 'newCodeExpression'],
    },
  },
  validateParams: (params): params is ActionParams<'updateCodeLine'> =>
    typeof params.codeLineId === 'string' &&
    typeof params.newVariableName === 'string' &&
    typeof params.newCodeExpression === 'string',
  handler: (editor, { codeLineId, newVariableName, newCodeExpression }) => {
    const entry = findNode<AnyElement>(editor, {
      match: matchElementId(codeLineId),
    });
    if (!entry) {
      throw notFound(`Could not find code line with id ${codeLineId}`);
    }
    const [codeLine, codeLinePath] = entry;
    if (!isElement(codeLine) || codeLine.type !== ELEMENT_CODE_LINE_V2) {
      throw notAcceptable(`element with id ${codeLineId} is not a code line`);
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
  },
};
