// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';
import { Functor } from '../types';

export const scalarNumericBinopFunctor: Functor = async ([
  a,
  b,
]: Type[]): Promise<Type> =>
  Type.either(
    Type.combine(a.isScalar('number'), b.sameAs(a)),
    Type.combine(a.isTrend(), b.sameAs(a))
  );
