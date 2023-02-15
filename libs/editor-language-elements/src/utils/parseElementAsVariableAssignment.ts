import { AST, parseExpression, Program } from '@decipad/computer';
import { statementToIdentifiedBlock } from './statementToIdentifiedBlock';

/**
 * Parse a variable assignment. Source code or AST.
 */
export function parseElementAsVariableAssignment(
  blockId: string,
  varName: string,
  source: string | AST.Expression,
  disallowedNodeTypes?: AST.Node['type'][]
): Program {
  const { solution: expression, error } =
    typeof source === 'string'
      ? source.trim() === ''
        ? parseExpression('0')
        : parseExpression(source, disallowedNodeTypes)
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

  return [statementToIdentifiedBlock(blockId, statement, varName)];
}
