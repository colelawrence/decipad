import { BuiltinSpec } from '../interfaces';
import { build as t, InferError } from '../../type';

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
