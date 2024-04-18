import { fromGeneratorPromise } from '@decipad/generator-utils';
import type { GenericResultGenerator } from '../Result';

export const fromGeneratorFunctionPromiseToGeneratorFunction = <T>(
  p: Promise<GenericResultGenerator<T>>
): GenericResultGenerator<T> => {
  return (start, end) => {
    return fromGeneratorPromise(p.then((gen) => gen(start, end)));
  };
};

export const fromGeneratorFunctionsPromiseToGeneratorFunctions = <T>(
  p: Promise<GenericResultGenerator<T>[]>,
  count: number
): GenericResultGenerator<T>[] => {
  return Array.from({ length: count }, (_, i) => {
    return (start, end) => {
      return fromGeneratorPromise(p.then((gen) => gen[i](start, end)));
    };
  });
};
