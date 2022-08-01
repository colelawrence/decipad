import { BuiltinSpec } from '../interfaces';

export const booleanOperators: Record<string, BuiltinSpec> = {
  '!': {
    argCount: 1,
    fn: ([a]) => !a,
    functionSignature: 'boolean -> boolean',
    operatorKind: 'prefix',
  },
  not: {
    aliasFor: '!',
  },
  '&&': {
    argCount: 2,
    fn: ([a, b]) => a && b,
    functionSignature: 'boolean, boolean -> boolean',
    operatorKind: 'infix',
  },
  and: {
    aliasFor: '&&',
  },
  '||': {
    argCount: 2,
    fn: ([a, b]) => a || b,
    functionSignature: 'boolean, boolean -> boolean',
    operatorKind: 'infix',
  },
  or: {
    aliasFor: '||',
  },
};
