import { AWSError } from 'aws-sdk';
import { awsRetry, retry } from '.';

const createAWSError = (message: string, retryable: boolean): AWSError => {
  const e = new Error(message) as AWSError;
  e.retryable = retryable;
  return e;
};

/* eslint-disable jest/no-standalone-expect */
describe('retry', () => {
  it('does not retry on AWS unretryable errors', async () => {
    let shouldRetryCalledCount = 0;
    await expect(() =>
      retry(
        () =>
          Promise.reject(
            createAWSError('The specified bucket does not exist', false)
          ),
        (err: AWSError) => {
          shouldRetryCalledCount += 1;
          return awsRetry(err);
        }
      )
    ).rejects.toThrow('The specified bucket does not exist');
    expect(shouldRetryCalledCount).toBe(1);
  });

  it('retries on AWS retryable errors', async () => {
    let shouldRetryCalledCount = 0;
    await expect(() =>
      retry(
        () => Promise.reject(createAWSError('Too many requests', true)),
        (err: AWSError) => {
          shouldRetryCalledCount += 1;
          return awsRetry(err);
        },
        { retries: 4, maxTimeout: 100, minTimeout: 10 }
      )
    ).rejects.toThrow('Too many requests');
    expect(shouldRetryCalledCount).toBe(5);
  });

  it('resolves on AWS retryable errors after success', async () => {
    let shouldRetryCalledCount = 0;
    expect(
      await retry(
        () =>
          shouldRetryCalledCount < 5
            ? Promise.reject(createAWSError('Too many requests', true))
            : Promise.resolve(42),
        (err: AWSError) => {
          shouldRetryCalledCount += 1;
          return awsRetry(err);
        },
        { maxTimeout: 100, minTimeout: 10 }
      )
    ).toBe(42);
    expect(shouldRetryCalledCount).toBe(5);
  });
});
