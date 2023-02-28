import DeciNumber from '@decipad/number';
import { AST, parseExpression } from '..';
import {
  findLiteralNumber,
  SimpleValueAST,
  simplisticFunctions,
} from './common';
import { getIdentifierString } from '../utils';

/**
 * Checks if `sourceCode` is a simple value.
 *
 * A simple value is a number, a percentage, or a number with a unit.
 */
export function isValue(
  sourceCode: AST.Expression | string,
  definedVariables = new Set<string>(),
  unitsOnly = false
): sourceCode is SimpleValueAST {
  if (typeof sourceCode === 'string' && sourceCode.trim() === '') return true;

  const exp =
    typeof sourceCode === 'string'
      ? parseExpression(sourceCode).solution
      : sourceCode;

  if (!exp) return false;

  if (exp.type === 'literal' && exp.args[0] === 'number') {
    return true;
  }

  const root = findLiteralNumber(exp);
  if (unitsOnly ? root != null : root == null) return false;

  return isArgListValue(exp, root, definedVariables);
}

function isArgListValue(
  exp: AST.Expression,
  root?: DeciNumber,
  definedVariables = new Set<string>(),
  depth = 0
): boolean {
  if (exp.type === 'ref') {
    return !definedVariables.has(exp.args[0]);
  }
  if (exp.type === 'function-call' && exp.args.length === 2) {
    const fname = getIdentifierString(exp.args[0]);

    if (simplisticFunctions.includes(fname)) {
      const [leftArg, rightArg] = exp.args[1].args;

      if (fname === '**' || fname === '^') {
        return (
          depth > 0 &&
          isPlainNumber(rightArg) &&
          leftArg.type === 'ref' &&
          !definedVariables.has(leftArg.args[0])
        );
      }

      if (isPlainNumber(leftArg) && leftArg.args[1] === root) {
        return (
          fname === 'implicit*' &&
          isArgListValue(rightArg, root, definedVariables, depth + 1)
        );
      }

      if (isPlainNumber(rightArg) && rightArg.args[1] === root) {
        return (
          fname === 'implicit*' &&
          isArgListValue(leftArg, root, definedVariables, depth + 1)
        );
      }

      return (
        isArgListValue(leftArg, root, definedVariables, depth + 1) &&
        isArgListValue(rightArg, root, definedVariables, depth + 1)
      );
    }

    return false;
  }

  return false;
}

function isPlainNumber(exp: AST.Expression) {
  return exp.type === 'literal' && exp.args[0] === 'number' && !exp.args[2];
}
