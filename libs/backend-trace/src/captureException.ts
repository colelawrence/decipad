import { AWSLambda as SentryAWSLambda, Integrations } from '@sentry/serverless';
import '@sentry/tracing';
import type { Boom } from '@hapi/boom';
import { boomify } from '@hapi/boom';
import { monitor as monitorConfig } from '@decipad/backend-config';
import meta from '@decipad/meta';
import { extraErrorDataIntegration } from '@sentry/integrations';

export type TraceOptions = Partial<{
  tracesSampleRate: number;
}>;

type SentryOptions = Parameters<typeof SentryAWSLambda.init>[0];

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const sentryInitOptions: SentryOptions = {
  dsn: sentryDSN,
  tracesSampleRate: 0.03,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: meta().version,
  enableTracing: true,
  integrations: [
    new Integrations.Apollo(),
    extraErrorDataIntegration(),
    new Integrations.Console(),
    new Integrations.Http(),
    new Integrations.Context(),
    new Integrations.RequestData({
      include: {
        cookies: true,
        data: true,
        headers: true,
        ip: true,
        query_string: true,
        url: true,
        user: true,
      },
    }),
  ],
};

let sentryInitialized = false;

export const initTrace = (options: TraceOptions = {}): boolean => {
  if (!sentryDSN) {
    return false;
  }
  if (!sentryInitialized) {
    SentryAWSLambda.init({ ...sentryInitOptions, ...options });
    sentryInitialized = true;
  }
  return true;
};

export const captureException = async (err: Error): Promise<Boom> => {
  const error = boomify(err as Error);
  if (initTrace()) {
    if (error.isServer) {
      SentryAWSLambda.captureException(error);
    }
    // eslint-disable-next-line no-await-in-loop
    if (!(await SentryAWSLambda.flush())) {
      // eslint-disable-next-line no-console
      console.warn('Failed to flush sentry event', error);
    }
  } else if (error.isServer) {
    // eslint-disable-next-line no-console
    console.error('Error caught without sentry initialized', error);
  }
  return error;
};
