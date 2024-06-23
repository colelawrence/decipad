import type { Program } from '@decipad/computer-interfaces';
import type { AST } from '@decipad/language-interfaces';
import {
  parseExpression,
  statementToIdentifiedBlock,
} from '@decipad/remote-computer';

/**
 * Parse a variable assignment. Source code or AST.
 */
export function parseElementAsVariableAssignment(
  blockId: string,
  varName: string,
  source: string | AST.Expression,
  isArtificial?: boolean,
  artificiallyDerivedFrom?: Array<string>
): Program {
  const { solution: expression, error } =
    typeof source === 'string'
      ? source.trim() === ''
        ? parseExpression('0')
        : parseExpression(source)
      : { solution: source, error: undefined };

  if (error) {
    return [
      {
        type: 'identified-error',
        errorKind: 'parse-error',
        id: blockId,
        source: typeof source === 'string' ? source : '',
        error,
        definesVariable: varName,
      },
    ];
  }

  const statement: AST.Statement | AST.Expression = varName
    ? {
        type: 'assign',
        args: [{ type: 'def', args: [varName] }, expression],
      }
    : expression;

  return [
    statementToIdentifiedBlock(
      blockId,
      statement,
      isArtificial,
      artificiallyDerivedFrom
    ),
  ];
}
