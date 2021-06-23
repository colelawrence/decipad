import { ErrorBoundary } from '@sentry/react';

function Fallback() {
  return <div>An error has occurred</div>;
}

const fallback = Fallback();

export function GlobalErrorHandler({ children }: { children: JSX.Element }) {
  return process.env.NODE_ENV === 'production' ? (
    <ErrorBoundary fallback={fallback} showDialog>
      {children}
    </ErrorBoundary>
  ) : (
    children
  );
}
