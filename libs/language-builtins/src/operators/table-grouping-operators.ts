import { BuiltinSpec } from '../interfaces';
// eslint-disable-next-line no-restricted-imports
import { InferError, buildType as t } from '@decipad/language-types';

export const tableGroupingOperators: { [fname: string]: BuiltinSpec } = {
  splitby: {
    argCount: 2,
    hidden: true,
    functor: () => t.impossible(InferError.retiredFeature('splitby')),
    fnValuesNoAutomap: () => {
      throw new Error('unreachable');
    },
  },
};
