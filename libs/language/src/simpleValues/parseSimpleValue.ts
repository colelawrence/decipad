import { AST, parseExpression } from '../parser';
import { findLiteralNumber, SimpleValue } from './common';
import { getSimpleValueUnit } from './getSimpleValueUnit';
import { isValue } from './isValue';

export function parseSimpleValue(
  sourceCode: string | AST.Expression,
  definedVariables = new Set<string>()
): SimpleValue | undefined {
  const exp =
    typeof sourceCode === 'string'
      ? parseExpression(sourceCode).solution
      : sourceCode;

  if (!exp) return undefined;

  const root = findLiteralNumber(exp);
  if (root && isValue(exp, definedVariables)) {
    // Split expression into value and unit
    const unit = getSimpleValueUnit(exp);

    if (unit === '%') {
      return { ast: root, unit: '%' };
    }
    if (unit == null) {
      return { ast: root, unit: undefined };
    }
    return { ast: root, unit: getSimpleValueUnit(exp) };
  }

  return undefined;
}
