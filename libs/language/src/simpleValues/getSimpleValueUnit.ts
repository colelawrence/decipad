import { c, getIdentifierString } from '../utils';
import { findLiteralNumber, SimpleValueAST } from './common';

export function getSimpleValueUnit(
  ast: SimpleValueAST
): SimpleValueAST | '%' | undefined {
  if (ast.type === 'literal') {
    return ast.args[2] === 'percentage' ? '%' : undefined;
  }

  const nonUnitPart = findLiteralNumber(ast);

  return (function recursiveBit(exp: SimpleValueAST): SimpleValueAST {
    if (exp.type === 'function-call') {
      const [name, { args: funcArgs }] = exp.args;
      const fname = getIdentifierString(name);

      const indexOfNonUnitPart = funcArgs.findIndex(
        (arg) => arg.type === 'literal' && arg.args[1] === nonUnitPart
      );

      if (indexOfNonUnitPart === -1) {
        return c(
          fname,
          ...funcArgs.map((arg) => recursiveBit(arg as SimpleValueAST))
        ) as SimpleValueAST;
      } else {
        return indexOfNonUnitPart === 0 ? funcArgs[1] : funcArgs[0];
      }
    } else {
      return exp;
    }
  })(ast);
}
