import { isSupportedBrowser } from '@decipad/support';
import { AnalyticsBrowser } from '@segment/analytics-next';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const sentryDsn = process.env.REACT_APP_SENTRY_DSN;

const analytics = (): AnalyticsBrowser | undefined => {
  const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    return AnalyticsBrowser.load({ writeKey });
  }
  return undefined;
};

let sentryInitialised = false;

export const initSentry = () => {
  if (sentryInitialised) {
    return;
  }
  sentryInitialised = true;
  Sentry.addTracingExtensions();
  Sentry.init({
    beforeSend: (event: Sentry.Event) => {
      if (!isSupportedBrowser()) {
        return null;
      }
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
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new Sentry.Replay({ maskAllText: true, blockAllMedia: true }),
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    tracesSampleRate: 0.1,
  });
};
