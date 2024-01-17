import { ErrorBoundary } from '@sentry/react';
import { useSession } from 'next-auth/react';
import { FC, ReactNode } from 'react';
// eslint-disable-next-line no-restricted-imports
import { IntercomProvider as Provider } from 'react-use-intercom';

export const IntercomProvider: FC<{ readonly children: ReactNode }> = ({
  children,
}) => {
  const session = useSession();

  return (
    <ErrorBoundary fallback={<></>}>
      <Provider
        appId={import.meta.env.VITE_INTERCOM_APP_ID!}
        autoBoot
        autoBootProps={{
          email: session.data?.user?.email,
          userId: session.data?.user?.id,
          name: session.data?.user?.name,
          userHash: session.data?.user?.intercomUserHash,
        }}
        shouldInitialize={session.status === 'authenticated'}
        initializeDelay={2000}
        apiBase={import.meta.env.VITE_INTERCOM_API_BASE}
      >
        {children}
      </Provider>
    </ErrorBoundary>
  );
};
