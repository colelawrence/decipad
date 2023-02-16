import { parseExpressionOrThrow } from '.';
import { FunctionCall } from './parser/ast-types';

export function isValue(sourceCode: string): boolean {
  if (sourceCode.trim().length === 0) {
    return true;
  }

  try {
    const exp = parseExpressionOrThrow(sourceCode);

    if (exp.type === 'literal') {
      return true;
    }
    if (exp.type === 'function-call') {
      return isArgListValue(exp);
    }

    return false;
  } catch (e) {
    return false;
  }
}

function isArgListValue(exp: FunctionCall): boolean {
  if (
    exp.args[1].args[0].type === 'literal' &&
    exp.args[1].args[1].type === 'ref'
  ) {
    return true;
  }

  if (
    exp.args[1].args[0].type === 'literal' &&
    exp.args[1].args[1].type === 'literal'
  ) {
    return false;
  }

  if (
    exp.args[1].args[0].type === 'function-call' &&
    exp.args[1].args[1].type === 'ref'
  ) {
    return isArgListValue(exp.args[1].args[0]);
  }

  return false;
}
