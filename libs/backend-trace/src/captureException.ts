import * as Sentry from '@sentry/aws-serverless';
import {
  captureConsoleIntegration,
  contextLinesIntegration,
  debugIntegration,
  extraErrorDataIntegration,
  graphqlIntegration,
  httpIntegration,
  requestDataIntegration,
} from '@sentry/node';
import type { Boom } from '@hapi/boom';
import { boomify } from '@hapi/boom';
import { monitor as monitorConfig } from '@decipad/backend-config';
import meta from '@decipad/meta';

export type TraceOptions = Partial<{
  tracesSampleRate: number;
}>;

type SentryOptions = Parameters<typeof Sentry.init>[0];

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
    graphqlIntegration(),
    extraErrorDataIntegration(),
    captureConsoleIntegration(),
    debugIntegration(),
    httpIntegration(),
    contextLinesIntegration(),
    requestDataIntegration({
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
    Sentry.init({ ...sentryInitOptions, ...options });
    sentryInitialized = true;
  }
  return true;
};

export const captureException = async (err: Error): Promise<Boom> => {
  const error = boomify(err as Error);
  if (initTrace()) {
    if (error.isServer) {
      Sentry.captureException(error);
    }
    // eslint-disable-next-line no-await-in-loop
    if (!(await Sentry.flush())) {
      // eslint-disable-next-line no-console
      console.warn('Failed to flush sentry event', error);
    }
  } else if (error.isServer) {
    // eslint-disable-next-line no-console
    console.error('Error caught without sentry initialized', error);
  }
  return error;
};
