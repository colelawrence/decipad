import { BuiltinSpec } from '../interfaces';
import { compare } from '../../interpreter/compare-values';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (a: any, b: any) => {
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b;
  }
  return compare(a, b) === 0;
};

export const equalityOperators: Record<string, BuiltinSpec> = {
  '==': {
    argCount: 2,
    fn: ([a, b]) => isEqual(a, b),
    functionSignature: 'A, A -> boolean',
  },
  '!=': {
    argCount: 2,
    fn: ([a, b]) => !isEqual(a, b),
    functionSignature: 'A, A -> boolean',
  },
};
