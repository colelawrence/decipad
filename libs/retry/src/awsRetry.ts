import type { AWSError } from 'aws-sdk';

export const awsRetry = (err: AWSError) => !!err.retryable;
