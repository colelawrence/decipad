import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import { Boom, boomify } from '@hapi/boom';
import { monitor as monitorConfig } from '@decipad/config';
import meta from '@decipad/meta';

export type TraceOptions = Partial<{
  tracesSampleRate: number;
}>;

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const sentryInitOptions = {
  dsn: sentryDSN,
  tracesSampleRate: 0.01,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: meta().version,
};

let sentryInitialized = false;

export const initTrace = (options: TraceOptions = {}) => {
  if (sentryDSN && !sentryInitialized) {
    SentryAWSLambda.init({ ...sentryInitOptions, ...options });
    sentryInitialized = true;
  }
};

export const captureException = async (err: Error): Promise<Boom> => {
  initTrace();
  const error = boomify(err as Error);
  if (error.isServer) {
    SentryAWSLambda.captureException(error);
  }
  await SentryAWSLambda.flush();
  return error;
};
