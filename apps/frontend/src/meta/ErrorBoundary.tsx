import * as Sentry from '@sentry/react';
import {
  ErrorInfo,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorPage } from './ErrorPage';

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
}> = ({ errorCount, resetErrorBoundary }) => {
  useEffect(() => {
    if (errorCount < 1) {
      resetErrorBoundary();
    }
  }, [errorCount, resetErrorBoundary]);

  return <ErrorPage Heading="h1" wellKnown="508" retry={resetErrorBoundary} />;
};

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({ children }) => {
  const [errorCount, setErrorCount] = useState(0);

  const onError = useCallback(
    (error: Error, info: ErrorInfo) => {
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
        (props) => (
          <ErrorRender {...props} errorCount={errorCount} />
        ),
        [errorCount]
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
};
