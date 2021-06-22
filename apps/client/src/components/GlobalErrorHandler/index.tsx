import { ReactNode } from 'react';
import { ErrorBoundary } from '@sentry/react';

function Fallback() {
  return <div>An error has occurred</div>;
}

const fallback = Fallback();

export function GlobalErrorHandler({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={fallback} showDialog>
      {children}
    </ErrorBoundary>
  );
}
