import { BuiltinSpec } from '../interfaces';

export const booleanOperators: Record<string, BuiltinSpec> = {
  '!': {
    argCount: 1,
    fn: ([a]) => !a,
    functionSignature: 'boolean -> boolean',
  },
  not: {
    aliasFor: '!',
  },
  '&&': {
    argCount: 2,
    fn: ([a, b]) => a && b,
    functionSignature: 'boolean, boolean -> boolean',
  },
  and: {
    aliasFor: '&&',
  },
  '||': {
    argCount: 2,
    fn: ([a, b]) => a || b,
    functionSignature: 'boolean, boolean -> boolean',
  },
  or: {
    aliasFor: '||',
  },
};
