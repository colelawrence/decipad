/* eslint-disable @typescript-eslint/promise-function-async */
import { all, map } from '@decipad/generator-utils';
import type { PromiseOrType } from '@decipad/utils';
import type { OneResult, ResultGenerator } from '../Result';
import pSeries from 'p-series';

export const materializeOneResult = async (
  _immatResult: PromiseOrType<OneResult>
): Promise<OneResult> => {
  const immatResult = await Promise.resolve(_immatResult);
  if (typeof immatResult === 'function') {
    const gen = immatResult as ResultGenerator;
    const result = await all(map(gen(), materializeOneResult));
    return result;
  }
  if (Array.isArray(immatResult)) {
    // TODO: we need to make materialization serial because the language does not yet support concurrency
    const arrayResult = await pSeries(
      immatResult.map((r) => () => materializeOneResult(r))
    );

    return arrayResult;
  }

  return immatResult;
};
