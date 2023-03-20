import type { AWSError } from 'aws-sdk';

export const awsRetry = (err: AWSError): [boolean, number | undefined] => [
  !!err.retryable,
  err.retryDelay != null ? err.retryDelay * 1000 : undefined,
];
