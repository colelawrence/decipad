import { fromGeneratorPromise } from '@decipad/generator-utils';
import type { Result } from '@decipad/language-interfaces';

export const fromGeneratorFunctionPromiseToGeneratorFunction = <T>(
  p: Promise<Result.GenericResultGenerator<T>>
): Result.GenericResultGenerator<T> => {
  return (start, end) => {
    return fromGeneratorPromise(p.then((gen) => gen(start, end)));
  };
};

export const fromGeneratorFunctionsPromiseToGeneratorFunctions = <T>(
  p: Promise<Result.GenericResultGenerator<T>[]>,
  count: number
): Result.GenericResultGenerator<T>[] => {
  return Array.from({ length: count }, (_, i) => {
    return (start, end) => {
      return fromGeneratorPromise(p.then((gen) => gen[i](start, end)));
    };
  });
};
