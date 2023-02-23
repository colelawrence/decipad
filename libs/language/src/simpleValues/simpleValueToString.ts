import DeciNumber, { N } from '@decipad/number';
import type { AST } from '..';
import { operators } from '../builtins/operators/operators';
import { prefixCurrencies } from '../grammar/tokenizer';
import { getIdentifierString } from '../utils';
import {
  deciNumberToSimpleString,
  SimpleValue,
  SimpleValueAST,
} from './common';
import { isValue } from './isValue';

/** Turns a simple value (an ast that passed `isValue`) into a string parsable by decilang. Returns undefined on error. */
export function simpleValueToString(exp?: SimpleValue): string | undefined {
  if (!exp) return undefined;

  const numberPart = print(exp.ast);
  const unitPart = print(exp.unit);

  if (numberPart == null || unitPart == null) {
    return undefined;
  }

  if (exp.unit === '%') {
    return `${numberPart}%`;
  }

  if (prefixCurrencies.includes(unitPart) && exp.ast.compare(N(0)) >= 0) {
    return unitPart + numberPart;
  } else {
    return join(numberPart, unitPart);
  }
}

export function simpleValueUnitToString(
  exp?: AST.Expression | '%' | undefined
): string | undefined {
  if (exp === '%') return '%';
  if (!exp) return '';
  if (!isValue(exp, undefined, true)) return undefined;

  return print(exp);
}

const join = (a: string, b: string) => (b ? `${a} ${b}` : a);

function print(
  exp: SimpleValueAST | DeciNumber | '%' | undefined
): string | undefined {
  if (!exp) return '';
  if (exp === '%') return '%';
  if (exp instanceof DeciNumber) {
    return deciNumberToSimpleString(exp);
  }

  switch (exp.type) {
    case 'literal': {
      if (exp.args[0] === 'number') {
        return print(exp.args[1]);
      }
      return undefined;
    }
    case 'function-call': {
      const [
        fNameAst,
        {
          args: [arg1, arg2],
        },
      ] = exp.args;
      const fname = getIdentifierString(fNameAst);

      const s1 = arg1 && print(arg1);
      const s2 = arg2 && print(arg2);

      if (fname === 'unary-') {
        return s1 && `-${s1}`;
      }
      if (fname === 'implicit*') {
        return s1 && s2 && `${s1} ${s2}`;
      }
      if (operators[fname]?.operatorKind === 'infix') {
        return s1 && s2 && `${s1} ${fname} ${s2}`;
      }

      return undefined;
    }

    case 'ref': {
      return exp.args[0];
    }

    default: {
      return undefined;
    }
  }
}
