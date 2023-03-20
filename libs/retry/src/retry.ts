/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import pRetry from 'p-retry';
import type { Options } from 'p-retry';
import { timeout } from '@decipad/utils';

type RetryFn<TError> = (error: TError) => [boolean, number | undefined];

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
  const pRetryOptions: Options & { signal: AbortSignal } = {
    ...options,
    signal: controller.signal,
    randomize: true,
    async onFailedAttempt(error) {
      if (shouldRetry != null) {
        const [retryable, waitFor] = shouldRetry(error as TError);
        if (!retryable) {
          controller.abort(error);
        } else if (waitFor) {
          await timeout(waitFor);
        }
      } else {
        console.warn('An error occurred, going to retry. Details below:');
        console.warn(error);
      }
    },
  };

  return pRetry(fn, pRetryOptions);
};
