import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { AnalyticsBrowser } from '@segment/analytics-next';

const sentryDsn = process.env.REACT_APP_SENTRY_DSN;

const analytics = (): AnalyticsBrowser | undefined => {
  const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    return AnalyticsBrowser.load({ writeKey });
  }
  return undefined;
};

export const initSentry = () =>
  Sentry.init({
    beforeSend: (event: Sentry.Event) => {
      event.exception?.values?.forEach((error) => {
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
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
  });
