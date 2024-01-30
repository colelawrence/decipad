import { AWSLambda as SentryAWSLambda, Integrations } from '@sentry/serverless';
import '@sentry/tracing';
import { ExtraErrorData } from '@sentry/integrations';
import { Boom, boomify } from '@hapi/boom';
import { monitor as monitorConfig } from '@decipad/backend-config';
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
  tracesSampleRate: 0.03,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: meta().version,
  enableTracing: true,
  integrations: [
    new Integrations.Apollo(),
    new ExtraErrorData(),
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
  initTrace();
  const error = boomify(err);
  if (error.isServer) {
    // eslint-disable-next-line no-console
    console.log('capturing exception', error.message);
    SentryAWSLambda.captureException(error);
  } else {
    // eslint-disable-next-line no-console
    console.log('NOT capturing exception', err);
  }
  await SentryAWSLambda.flush();
  return error;
};
