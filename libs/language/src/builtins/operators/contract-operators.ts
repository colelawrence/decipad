import { BuiltinSpec } from '../interfaces';
import { RuntimeError } from '../../value';

export const contractOperators: Record<string, BuiltinSpec> = {
  assert: {
    argCount: 1,
    fn: ([preconditionNotMet]) => {
      if (!preconditionNotMet) {
        throw new RuntimeError('User defined pre-condition was not met');
      }
      return true;
    },
    functionSignature: 'boolean -> boolean',
    explanation:
      'Creates an error in the notebook if the condition is not true',
  },
};
