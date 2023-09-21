import { useSession } from 'next-auth/react';
import { FC, ReactNode } from 'react';
import { IntercomProvider as Provider } from 'react-use-intercom';

export const IntercomProvider: FC<{ readonly children: ReactNode }> = ({
  children,
}) => {
  const session = useSession();

  return (
    <Provider
      appId={process.env.REACT_APP_INTERCOM_APP_ID!}
      autoBoot
      autoBootProps={{
        email: session.data?.user?.email,
        userId: session.data?.user?.id,
        name: session.data?.user?.name,
        userHash: session.data?.user?.intercomUserHash,
      }}
      shouldInitialize={session.status === 'authenticated'}
      initializeDelay={2000}
      apiBase={process.env.REACT_APP_INTERCOM_API_BASE}
    >
      {children}
    </Provider>
  );
};
