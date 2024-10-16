// eslint-disable-next-line no-restricted-imports
import { Type, Value, buildType } from '@decipad/language-types';
import { coerceToFraction } from '../utils/coerceToFraction';
import { binopBuiltin } from '../utils/binopBuiltin';
import { overloadBuiltin } from '../overloadBuiltin';
import type { Functor } from '../types';
import { reverseFunctor } from '../utils/reverseFunctor';
import { getDefined } from '@decipad/utils';
import { Result, Value as ValueTypes } from '@decipad/language-interfaces';

const divFunctor: Functor = async ([a, b]) => {
  return Type.either(
    (await Type.combine(a.isTrend(), b.isTrend())).mapType(async () => {
      return buildType.trend({
        trendOf: await (
          await getDefined(a.trendOf, 'not a trend (1)').sharePercentage(
            getDefined(b.trendOf, 'not a trend (2)')
          )
        ).divideUnit(getDefined(b.trendOf).unit),
      });
    }),
    Type.combine(
      a.isScalar('number'),
      b.isScalar('number'),
      (await a.sharePercentage(b)).divideUnit(b.unit)
    )
  );
};

const primitiveTrendEval = (
  n1: Result.OneResult,
  n2: Result.OneResult
): ValueTypes.TrendValue => {
  const a = Value.getTrendValue(n1);
  const b = Value.getTrendValue(n2);
  return Value.Trend.from(
    b?.first && a?.first?.div(b?.first),
    b?.last && a?.last?.div(b?.last)
  );
};

export const div = overloadBuiltin(
  '/',
  2,
  binopBuiltin('/', {
    primitiveEval: (n1, n2) =>
      Value.isTrendValue(n1)
        ? primitiveTrendEval(n1, n2)
        : coerceToFraction(n1).div(coerceToFraction(n2)),
    primitiveReverseEval: (n1, n2) =>
      coerceToFraction(n2).div(coerceToFraction(n1)),
    primitiveFunctor: divFunctor,
    primitiveReverseFunctor: reverseFunctor(divFunctor),
  }),
  'infix'
);
