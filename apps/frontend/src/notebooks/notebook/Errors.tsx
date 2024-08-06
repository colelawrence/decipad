import { ErrorPage } from '@decipad/ui';
import { FC, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

class NotebookResourceError extends Error {
  constructor() {
    super();
  }
}

export function notebookErrorFactory(message: string): Error {
  if (/no such/i.test(message) || /forbidden/i.test(message)) {
    return new NotebookResourceError();
  }

  return new Error(message);
}

export const NotebookErrorBoundary: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => {
        if (error instanceof NotebookResourceError) {
          return <ErrorPage Heading="h1" wellKnown="404" />;
        }

        throw error;
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
