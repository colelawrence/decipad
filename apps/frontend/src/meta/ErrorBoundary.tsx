import { ComponentProps, FC, ReactNode, useCallback } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';
import { useLocation } from 'react-router-dom';
import { ErrorPage } from './ErrorPage';
import { useAnalytics } from './providers/AnalyticsProvider';

interface ErrorBoundaryProps {
  readonly Heading: ComponentProps<typeof ErrorPage>['Heading'];
  readonly children: ReactNode;
}

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({
  children,
  Heading,
}) => {
  const analytics = useAnalytics();
  const location = useLocation();
  const onError = useCallback(
    (error: Error) => {
      try {
        const eventId = Sentry.captureException(error);
        analytics?.track('error', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          url: location.pathname,
          sentryEventId: eventId,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [analytics, location]
  );
  return (
    <ReactErrorBoundary
      onError={onError}
      fallback={<ErrorPage Heading={Heading} />}
    >
      {children}
    </ReactErrorBoundary>
  );
};
