import type { AST, Parser } from '@decipad/remote-computer';
import { parseStatement, isExpression } from '@decipad/remote-computer';

interface ExpressionFromEditorNodesResult {
  expression?: AST.Statement;
  error?: Parser.ParserError;
  source: string;
}
export const expressionFromEditorSource = (
  source: string
): ExpressionFromEditorNodesResult => {
  const { solution, error } = parseStatement(source);
  const expression = solution && isExpression(solution) ? solution : undefined;
  return { expression, error, source };
};
