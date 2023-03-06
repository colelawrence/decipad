/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import pRetry from 'p-retry';
import type { Options } from 'p-retry';

type RetryFn<TError> = (error: TError) => boolean;

interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
}

export const retry = <TReturn, TError>(
  fn: () => Promise<TReturn>,
  shouldRetry?: RetryFn<TError>,
  options: RetryOptions = {}
): Promise<TReturn> => {
  const controller = new AbortController();
  const pRetryOptions: Options = {
    ...options,
    signal: controller.signal,
    randomize: true,
    onFailedAttempt(error) {
      if (shouldRetry != null && !shouldRetry(error as TError)) {
        controller.abort(error);
      } else {
        console.warn('An error occurred, going to retry. Details below:');
        console.warn(error);
      }
    },
  };

  return pRetry(fn, pRetryOptions);
};
