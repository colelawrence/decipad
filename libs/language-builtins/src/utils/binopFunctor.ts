// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';

export const binopFunctor = async ([a, b]: Type[]) =>
  Type.either(
    Type.combine(a.isScalar('number'), b.sameAs(a)),
    Type.combine(a.isTrend(), b.sameAs(a))
  );
