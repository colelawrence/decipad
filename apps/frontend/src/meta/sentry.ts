import { useEffect } from 'react';
import { AnalyticsBrowser } from '@segment/analytics-next';
import * as Sentry from '@sentry/react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { env } from '@decipad/client-env';

const sentryDsn = env.VITE_SENTRY_DSN;

const analytics = (): AnalyticsBrowser | undefined => {
  const writeKey = env.VITE_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    try {
      return AnalyticsBrowser.load({ writeKey });
    } catch (err) {
      console.error('Error loading analytics', err);
    }
  }
  return undefined;
};

let sentryInitialised = false;

export const initSentry = () => {
  if (sentryInitialised) {
    return;
  }
  try {
    sentryInitialised = true;
    Sentry.registerSpanErrorInstrumentation();
    Sentry.init({
      beforeSend: (event) => {
        event.exception?.values?.forEach((error) => {
          if (!error.mechanism?.handled) {
            return;
          }
          analytics()?.track('error', {
            type: error.type,
            name: error.value,
            stack: error.stacktrace,
            url: global.location.pathname,
            sentryEventId: event.event_id,
          });
        });

        return event;
      },
      dsn: sentryDsn,
      replaysSessionSampleRate: 0.2,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
        Sentry.extraErrorDataIntegration(),
        Sentry.httpClientIntegration(),
      ],
      tracesSampleRate: 0.3,
      enableTracing: true,
      tracePropagationTargets: ['/graphql', '/api'],
    });
  } catch (err) {
    console.error('Error initialising Sentry');
    console.error(err);
  }
};
