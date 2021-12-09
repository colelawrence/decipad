import { ErrorBoundary } from '@sentry/react';
import { FC } from 'react';

function Fallback() {
  return <div>An error has occurred</div>;
}

const fallback = Fallback();

export function GlobalErrorHandler({
  children,
}: {
  children: JSX.Element;
}): ReturnType<FC> {
  return process.env.NODE_ENV === 'production' ? (
    <ErrorBoundary fallback={fallback} showDialog>
      {children}
    </ErrorBoundary>
  ) : (
    children
  );
}
