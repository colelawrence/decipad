import { all, map } from '@decipad/generator-utils';
import type { PromiseOrType } from '@decipad/utils';
import pSeries from 'p-series';
import type { ResultGenerator } from '../interpreter/interpreter-types';
import type { OneResult } from '../result';

export const materializeOneResult = async (
  _result: PromiseOrType<OneResult>
): Promise<OneResult> => {
  const result = await _result;
  if (Array.isArray(result)) {
    // TODO: we need to make materialization serial because the language does not yet support concurrency
    return pSeries(
      result.map((r) => async () => materializeOneResult(r))
    ) as Promise<OneResult>;
  }
  if (typeof result === 'function') {
    const gen = result as ResultGenerator;
    return all(map(gen(), materializeOneResult));
  }
  return result;
};
