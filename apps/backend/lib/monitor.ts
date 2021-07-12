import { Handler } from 'aws-lambda';
import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import { monitor as monitorConfig } from './config';
import { version } from '../package.json';

interface WrapOptions {
  rethrow: boolean;
}

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

if (sentryDSN) {
  SentryAWSLambda.init({
    dsn: sentryDSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    release: version,
  });
}

export function wrapHandler<T>(
  handler: Handler<T>,
  options: Partial<WrapOptions> = {}
) {
  if (sentryDSN) {
    const { rethrow = true } = options;
    return SentryAWSLambda.wrapHandler(handler, {
      rethrowAfterCapture: rethrow,
    });
  }
  return handler;
}
