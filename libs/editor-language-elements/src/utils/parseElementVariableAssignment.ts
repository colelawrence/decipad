import { AST, parseOneExpression } from '@decipad/computer';
import { LanguageBlock } from '../types';

/**
 * Parse a variable assignment. Source code or AST.
 */
export function parseElementVariableAssignment(
  blockId: string,
  varName: string,
  source: string | AST.Expression
): LanguageBlock {
  try {
    const expression =
      typeof source === 'string' ? parseOneExpression(source) : source;
    return {
      program: [
        {
          type: 'identified-block',
          id: blockId,
          block: {
            type: 'block',
            id: blockId,
            args: [
              {
                type: 'assign',
                args: [{ type: 'def', args: [varName] }, expression],
              },
            ],
          },
          source: typeof source === 'string' ? source : '',
        },
      ],
      parseErrors: [],
    };
  } catch (error) {
    return {
      program: [],
      parseErrors: [
        {
          elementId: blockId,
          error: (error as Error).message,
        },
      ],
    };
  }
}
