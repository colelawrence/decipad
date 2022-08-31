import { parseOneExpression, parseOneStatement } from '@decipad/computer';
import { LanguageBlock } from '../types';

/**
 * The main function that passes user code through to computer
 *
 * Ensures only one statement is parsed
 */
export function parseElementSourceCode(
  blockId: string,
  source: string,
  sourceKind: 'statement' | 'expression' = 'statement'
): LanguageBlock {
  try {
    const statementOrExpression =
      sourceKind === 'statement'
        ? parseOneStatement(source)
        : parseOneExpression(source);
    return {
      program: [
        {
          type: 'identified-block',
          id: blockId,
          block: {
            type: 'block',
            id: blockId,
            args: [statementOrExpression],
          },
          source,
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
