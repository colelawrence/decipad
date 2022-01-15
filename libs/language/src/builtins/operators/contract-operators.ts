import { BuiltinSpec } from '../interfaces';
import { RuntimeError } from '../../interpreter/RuntimeError';

export const contractOperators: Record<string, BuiltinSpec> = {
  assert: {
    argCount: 1,
    fn: (preconditionNotMet) => {
      if (!preconditionNotMet) {
        throw new RuntimeError('User defined pre-condition was not met');
      }
      return true;
    },
    functor: ([a]) => a.isScalar('boolean'),
  },
};
