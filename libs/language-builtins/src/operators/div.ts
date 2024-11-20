// eslint-disable-next-line no-restricted-imports
import { Type, Value, buildType } from '@decipad/language-types';
import { overloadBuiltin } from '../overloadBuiltin';
import type { Functor } from '../types';
import { getDefined } from '@decipad/utils';
import { Result, Value as ValueTypes } from '@decipad/language-interfaces';
import { wasmUniversalBinopEval } from '../utils/wasmUniversalBinopEval';
import { computeBackendSingleton } from '@decipad/compute-backend-js';
import { binOpBuiltinForUniversalEval } from '../utils/binopBuiltinForUniversalEval';

const singleDivFunctor = async ([a, b]: Type[]) => {
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

const divFunctorNums: Functor = async ([a, b]) => {
  return singleDivFunctor([a, b]);
};

const divFunctorNumsReverse: Functor = async ([b, a]) => {
  return singleDivFunctor([a, b]);
};

const divUniversalEval = async (
  a: Result.OneResult,
  b: Result.OneResult,
  [aType, bType]: Type[]
): Promise<ValueTypes.Value> => {
  if (Value.isTrendValue(a)) {
    return primitiveTrendEval(a, b);
  } else {
    return divNumEval(a, b, [aType, bType]);
  }
};

const divNumEval = wasmUniversalBinopEval((...args) =>
  computeBackendSingleton.computeBackend.divide_results(...args)
);

const divFunctorCols: Functor = async ([a, b]) => {
  const divRes = await singleDivFunctor([
    await a.reducedToLowest(),
    await b.reducedToLowest(),
  ]);

  return divRes.mapType(async (t) => buildType.column(t, a.indexedBy));
};

const divFunctorColsReverse: Functor = async ([a, b]) => {
  const divRes = await singleDivFunctor([
    await a.reducedToLowest(),
    await b.reducedToLowest(),
  ]);

  return divRes.mapType(async (t) => buildType.column(t, b.indexedBy));
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

const divBinopPrimitiveFunctor: Functor = async (...args) =>
  Type.either(divFunctorNums(...args), divFunctorCols(...args));

const divBinopPrimitiveFunctorReverse: Functor = async (...args) =>
  Type.either(divFunctorNumsReverse(...args), divFunctorColsReverse(...args));

export const div = overloadBuiltin(
  '/',
  2,
  [
    ...binOpBuiltinForUniversalEval({
      primitiveFunctor: divBinopPrimitiveFunctor,
      primitiveReverseFunctor: divBinopPrimitiveFunctorReverse,
      universalEval: divUniversalEval,
    }),
  ],
  'infix'
);
