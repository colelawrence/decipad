import DeciNumber, { N } from '@decipad/number';
import type { AST } from '..';
import { prefixCurrencies } from '../grammar/tokenizer';

export const simplisticFunctions = [
  '**',
  '^',
  'implicit*',
  'unary-',
  'per',
  'for',
  '/',
  '*',
];

interface SimplisticCall extends AST.FunctionCall {
  args: [AST.FuncRef, AST.ArgList & { args: SimpleValueAST[] }];
}

export const deciNumberToSimpleString = (n: DeciNumber) => {
  let f = N(n).toFraction();
  if (/^-?[0-9.]+$/.test(f)) {
    return f;
  }
  f = N(n).toString();
  if (/^-?[0-9.]+$/.test(f)) {
    return f;
  }

  return undefined;
};

/** A subset of the language that describes a simple number and optional unit */
export type SimpleValueAST =
  | Extract<AST.Expression, { type: 'literal' | 'ref' }>
  | SimplisticCall;

export type SimpleValue = {
  ast: DeciNumber;
  unit: SimpleValueAST | '%' | undefined;
};

/** Finds the literal number (left-most) of an AST.Expression */
export function findLiteralNumber(exp: AST.Expression): DeciNumber | undefined {
  if (exp.type === 'literal' && exp.args[0] === 'number') {
    const num =
      exp.args[2] === 'percentage' ? exp.args[1].mul(N(100)) : exp.args[1];
    return deciNumberToSimpleString(num) ? num : undefined;
  }
  if (exp.type === 'function-call') {
    const funcArgs = exp.args[1].args;
    if (
      funcArgs[0].type === 'ref' &&
      prefixCurrencies.includes(funcArgs[0].args[0])
    ) {
      return findLiteralNumber(funcArgs[1]);
    }
    return findLiteralNumber(funcArgs[0]);
  }
  return undefined;
}
