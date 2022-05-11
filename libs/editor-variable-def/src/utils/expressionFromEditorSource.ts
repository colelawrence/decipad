import { AST, Computer, Parser } from '@decipad/computer';

interface ExpressionFromEditorNodesResult {
  expression?: AST.Statement;
  error?: Parser.ParserError;
  source: string;
}
export const expressionFromEditorSource = (
  computer: Computer,
  source: string
): ExpressionFromEditorNodesResult => {
  const { statement, error } = computer.parseStatement(source);
  const expression =
    statement && computer.isExpression(statement) ? statement : undefined;
  return { expression, error, source };
};
