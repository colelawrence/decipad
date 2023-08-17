import isPromise from 'is-promise';

export type PromiseOrType<T> = Promise<T> | T;

/**
 * Monadic bind operator for PromiseOrType.
 *
 * If the input is a promise, it will be awaited and the result will be passed
 * to the function. Otherwise, the function will be called with the input.
 *
 * Example:
 *   let url: PromiseOrType<'https://example.com'>
 *   let fetchWithCache: (url: string) => PromiseOrType<Response>
 *   const result: PromiseOrType<Response> = bind(url, fetchWithCache)
 */
export const bind = <T, R>(
  x: PromiseOrType<T>,
  f: (_x: T) => PromiseOrType<R>
): PromiseOrType<R> => (isPromise(x) ? x.then(f) : f(x));

/**
 * Converts an array of PromiseOrType objects to a PromiseOrType of an array.
 *
 * The inputs must be wrapped in thunk functions to prevent them from being
 * evaluated too early.
 *
 * Example:
 *   const urls = ['https://hello.com', 'https://world.com']
 *   const responsePs: (() => PromiseOrType<Response>)[] = urls.map(
 *     (url) => () => fetchWithCache(url)
 *   )
 *   const responsesP: PromiseOrType<Response[]> = sequence(responsesP)
 */
export const sequence = <T>(
  inputPs: (() => PromiseOrType<T>)[]
): PromiseOrType<T[]> =>
  inputPs.reduce(
    (resultPs, inputP) =>
      bind(resultPs, (result) => bind(inputP(), (input) => [...result, input])),
    [] as PromiseOrType<T[]>
  );
