import { AST, Parser, parseStatement, isExpression } from '@decipad/computer';

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
