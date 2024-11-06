import * as Sentry from '@sentry/react';
import type { ErrorInfo, FC, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import { ErrorPage } from './ErrorPage';
import { isExpectableServerSideError } from '../utils/isExpectableServerSideError';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

class SentryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SentryError';
  }

  setCustomMessage(message: string) {
    this.message = message;
  }
}

const ErrorRender: FC<{
  errorCount: number;
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ errorCount, error, resetErrorBoundary }) => {
  useEffect(() => {
    if (errorCount < 1) {
      resetErrorBoundary();
    }
  }, [errorCount, resetErrorBoundary]);

  return (
    <ErrorPage
      Heading="h1"
      wellKnown="508"
      retry={resetErrorBoundary}
      error={error}
    />
  );
};

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({ children }) => {
  const [errorCount, setErrorCount] = useState(0);

  const onError = useCallback(
    (error: Error, info: ErrorInfo) => {
      console.error('Error caught on error boundary', error);
      if (isExpectableServerSideError(error)) {
        return;
      }
      setErrorCount(errorCount + 1);
      console.error(error);
      const sentryError = new SentryError(error.message);
      sentryError.setCustomMessage(
        `Page crash: ${error.message}: (${info.componentStack.substring(
          0,
          100
        )})`
      );

      try {
        Sentry.captureException(sentryError, {
          level: errorCount > 1 ? 'fatal' : 'error',
          extra: {
            info,
            errorCount,
          },
        });
      } catch (err) {
        console.error(sentryError);
      }
    },
    [errorCount]
  );

  return (
    <ReactErrorBoundary
      onError={onError}
      fallbackRender={useCallback(
        (props: FallbackProps) => (
          <ErrorRender {...props} errorCount={errorCount} />
        ),
        [errorCount]
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
};
