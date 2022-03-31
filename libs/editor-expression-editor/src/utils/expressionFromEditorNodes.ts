import { AST, Computer, Parser } from '@decipad/language';
import { Node } from 'slate';

interface ExpressionFromEditorNodesResult {
  expression?: AST.Statement;
  error?: Parser.ParserError;
  source: string;
}
export const expressionFromEditorNodes = (
  computer: Computer,
  nodes: Node[]
): ExpressionFromEditorNodesResult => {
  const source = Node.string(nodes[0]);
  const { statement, error } = computer.parseStatement(source);
  const expression =
    statement && computer.isExpression(statement) ? statement : undefined;
  return { expression, error, source };
};
