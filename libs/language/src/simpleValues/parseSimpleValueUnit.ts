// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
import { parseExpression } from '../parser';
import type { SimpleValueAST } from './common';
import { findLiteralNumber } from './common';
import { getSimpleValueUnit } from './getSimpleValueUnit';
import { isValue } from './isValue';

export function parseSimpleValueUnit(
  sourceCode: string | AST.Expression,
  definedVariables = new Set<string>()
): SimpleValueAST | '%' | undefined {
  if (String(sourceCode).trim() === '') return undefined;
  if (sourceCode === '%') return '%';

  const exp =
    typeof sourceCode === 'string'
      ? parseExpression(sourceCode).solution
      : sourceCode;

  if (exp && isValue(exp, definedVariables, true) && !findLiteralNumber(exp)) {
    return getSimpleValueUnit(exp);
  } else {
    return undefined;
  }
}
