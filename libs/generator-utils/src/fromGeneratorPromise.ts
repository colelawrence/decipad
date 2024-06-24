/* eslint-disable no-underscore-dangle */
import { WithFromArray } from './types';

export const fromGeneratorPromise = async function* fromGeneratorPromise<T>(
  genP: Promise<WithFromArray<T> & AsyncGenerator<T>>
): AsyncGenerator<T> {
  yield* await genP;
};
