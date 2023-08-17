/* eslint-disable @typescript-eslint/promise-function-async */
import { all, map } from '@decipad/generator-utils';
import { PromiseOrType, bind, sequence } from '@decipad/utils';
import type { ResultGenerator } from '../interpreter/interpreter-types';
import type { OneResult } from '../result';

export const materializeOneResult = (
  _result: PromiseOrType<OneResult>
): PromiseOrType<OneResult> =>
  bind(_result, (result) => {
    if (Array.isArray(result)) {
      // TODO: we need to make materialization serial because the language does not yet support concurrency
      return sequence(result.map((r) => () => materializeOneResult(r)));
    }

    if (typeof result === 'function') {
      const gen = result as ResultGenerator;
      return all(map(gen(), materializeOneResult));
    }
    return result;
  });
