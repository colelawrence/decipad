import * as Sentry from '@sentry/react';
import {
  ComponentProps,
  ErrorInfo,
  FC,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorPage } from './ErrorPage';

interface ErrorBoundaryProps {
  readonly Heading: ComponentProps<typeof ErrorPage>['Heading'];
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

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({
  children,
  Heading,
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const [previousErrorDate, setPreviousErrorDate] = useState<
    number | undefined
  >();
  const onError = useCallback(
    (error: Error, info: ErrorInfo) => {
      setPreviousErrorDate(Date.now());
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
          level: 'fatal',
          extra: {
            info,
          },
        });
      } catch (err) {
        console.error(sentryError);
      }
      if (previousErrorDate && Date.now() - previousErrorDate < 2000) {
        setTimeout(() => setErrorCount((c) => c + 1), 1000);
      }
    },
    [previousErrorDate]
  );

  return (
    <ReactErrorBoundary
      onError={onError}
      fallbackRender={() => <ErrorPage Heading={Heading} />}
      resetKeys={[errorCount]}
    >
      {children}
    </ReactErrorBoundary>
  );
};
