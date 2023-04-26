import {
  ComponentProps,
  ErrorInfo,
  FC,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';
import { ErrorPage } from './ErrorPage';

interface ErrorBoundaryProps {
  readonly Heading: ComponentProps<typeof ErrorPage>['Heading'];
  readonly children: ReactNode;
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
      // eslint-disable-next-line no-param-reassign
      error.message = `Page crash: ${
        error.message
      }: (${info.componentStack.substring(0, 100)})`;
      try {
        Sentry.captureException(error, {
          level: 'fatal',
          extra: {
            info,
          },
        });
      } catch (err) {
        console.error(err);
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
