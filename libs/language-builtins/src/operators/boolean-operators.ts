import { BuiltinSpec } from '../interfaces';

export const booleanOperators: Record<string, BuiltinSpec> = {
  '!': {
    argCount: 1,
    fn: ([a]) => !a,
    functionSignature: 'boolean -> boolean',
    operatorKind: 'prefix',
    toMathML: (args) => `<mo>!</mo><mo>(</mo>${args[0]}<mo>)</mo>`,
  },
  not: {
    aliasFor: '!',
  },
  '&&': {
    argCount: 2,
    fn: ([a, b]) => a && b,
    functionSignature: 'boolean, boolean -> boolean',
    operatorKind: 'infix',
    toMathML: (args) => `${args[0]}<mspace /><mo>&&</mo><mspace />${args[1]}`,
  },
  and: {
    aliasFor: '&&',
  },
  '||': {
    argCount: 2,
    fn: ([a, b]) => a || b,
    functionSignature: 'boolean, boolean -> boolean',
    operatorKind: 'infix',
    toMathML: (args) => `${args[0]}<mspace /><mo>||</mo><mspace />${args[1]}`,
  },
  or: {
    aliasFor: '||',
    hidden: true,
  },
};
