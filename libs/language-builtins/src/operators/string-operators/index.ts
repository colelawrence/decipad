import { Type } from '@decipad/language-interfaces';
import { BuiltinSpec } from '../../types';

export const stringOperators: Record<string, BuiltinSpec> = {
  lowercase: {
    argCount: 1,
    autoConvertArgs: false,
    fn: ([n]) => String(n).toLowerCase(),
    functor: async ([n]: Type[]) => n.isScalar('string'),
    explanation: 'Lowercases a string',
    formulaGroup: 'Strings',
    syntax: 'lowercase(String)',
    example: 'lowercase("Hello World")',
  },
};
