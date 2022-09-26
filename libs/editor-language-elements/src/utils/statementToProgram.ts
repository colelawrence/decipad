import { AST } from '@decipad/computer';
import { LanguageBlock, ParseError } from '../types';

/**
 * Parse a variable assignment. Source code or AST.
 */
export function statementToProgram(
  blockId: string,
  statement: AST.Statement | undefined,
  parseErrors: ParseError[]
): LanguageBlock {
  const blockArgs = statement ? [statement] : [];
  return {
    program: [
      {
        type: 'identified-block',
        id: blockId,
        block: {
          type: 'block',
          id: blockId,
          args: blockArgs,
        },
        source: '',
      },
    ],
    parseErrors,
  };
}
