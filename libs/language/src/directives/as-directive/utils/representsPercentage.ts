import { AST } from '@decipad/language-interfaces';

export function representsPercentage(
  unitExpr: AST.Expression | AST.GenericIdentifier
): unitExpr is AST.GenericIdentifier {
  // Parser only uses "generic-identifier" to represent percentage here
  return unitExpr.type === 'generic-identifier';
}
