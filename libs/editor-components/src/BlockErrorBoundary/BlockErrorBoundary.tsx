import { FC, ReactNode, useMemo } from 'react';
import { ErrorBoundary } from '@sentry/react';
import { atoms } from '@decipad/ui';

interface FallbackProps {
  error: Error;
  componentStack: string | null;
}

const Fallback: FC<FallbackProps> = ({
  error,
  componentStack,
}: FallbackProps) => {
  const message = useMemo<string>(
    () =>
      `Unexpected error: ${error.message} in ${
        componentStack?.split('\n').filter(Boolean)[0]
      }`,
    [componentStack, error.message]
  );
  return <atoms.ErrorMessage message={message}></atoms.ErrorMessage>;
};

export function BlockErrorBoundary({
  children,
}: {
  children: ReactNode;
}): ReturnType<FC> {
  return (
    <ErrorBoundary
      fallback={(props) => <Fallback {...props} />}
      showDialog={false}
    >
      {children}
    </ErrorBoundary>
  );
}
