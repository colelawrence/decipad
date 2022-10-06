import { ComponentProps, FC, ReactNode, useCallback, useState } from 'react';
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
    (error: Error) => {
      setPreviousErrorDate(Date.now());
      console.error(error);
      try {
        Sentry.captureException(error);
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
