import { ComponentProps, FC, ReactNode, useCallback } from 'react';
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
  const onError = useCallback((error: Error) => {
    console.error(error);
    try {
      Sentry.captureException(error);
    } catch (err) {
      console.error(err);
    }
  }, []);
  return (
    <ReactErrorBoundary
      onError={onError}
      fallback={<ErrorPage Heading={Heading} />}
    >
      {children}
    </ReactErrorBoundary>
  );
};
