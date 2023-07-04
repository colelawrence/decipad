import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import '@sentry/tracing';
import { Boom, boomify } from '@hapi/boom';
import { monitor as monitorConfig } from '@decipad/config';
import meta from '@decipad/meta';

export type TraceOptions = Partial<{
  tracesSampleRate: number;
}>;

type SentryOptions = Parameters<typeof SentryAWSLambda.init>[0];

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const sentryInitOptions: SentryOptions = {
  dsn: sentryDSN,
  tracesSampleRate: 0.01,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: meta().version,
  enableTracing: true,
};

let sentryInitialized = false;

export const initTrace = (options: TraceOptions = {}): boolean => {
  if (!sentryDSN) {
    return false;
  }
  if (sentryDSN && !sentryInitialized) {
    SentryAWSLambda.init({ ...sentryInitOptions, ...options });
    sentryInitialized = true;
  }
  return true;
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
