// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';

export const binopFunctor = async ([a, b]: Type[]) =>
  Type.combine(a.isScalar('number'), b.sameAs(a));
