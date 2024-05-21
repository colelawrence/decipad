/* eslint-disable @typescript-eslint/promise-function-async */
import { all, map } from '@decipad/generator-utils';
import type { PromiseOrType } from '@decipad/utils';
import type { Result } from '@decipad/language-interfaces';

export const materializeOneResult = async (
  _immatResult: PromiseOrType<Result.OneResult>
): Promise<Result.OneResult> => {
  const immatResult = await Promise.resolve(_immatResult);
  if (typeof immatResult === 'function') {
    const gen = immatResult as Result.ResultGenerator;
    const result = await all(map(gen(), materializeOneResult));
    return result;
  }
  if (Array.isArray(immatResult)) {
    const arrayResult = await Promise.all(
      immatResult.map((r) => materializeOneResult(r))
    );

    return arrayResult;
  }

  return immatResult;
};
