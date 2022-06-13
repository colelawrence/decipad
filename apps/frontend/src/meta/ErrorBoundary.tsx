import { ComponentProps, FC, ReactNode } from 'react';
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
  return (
    <ReactErrorBoundary
      onError={(error) => Sentry.captureException(error)}
      fallback={<ErrorPage Heading={Heading} />}
    >
      {children}
    </ReactErrorBoundary>
  );
};
