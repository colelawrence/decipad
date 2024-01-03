// eslint-disable-next-line no-restricted-imports
import { RuntimeError } from '@decipad/language-types';
import { BuiltinSpec } from '../interfaces';

export const contractOperators: Record<string, BuiltinSpec> = {
  assert: {
    argCount: 1,
    fn: ([preconditionMet]) => {
      if (!preconditionMet) {
        throw new RuntimeError('User defined pre-condition was not met');
      }
      return true;
    },
    functionSignature: 'boolean -> boolean',
    explanation:
      'Creates an error in the notebook if the condition is not true.',
    formulaGroup: 'Correctness',
    syntax: 'assert(Condition)',
    example: 'assert(Balance < $0)',
  },
};
