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
        name: session.data?.user?.name,
      }}
      shouldInitialize={session.status === 'authenticated'}
    >
      {children}
    </Provider>
  );
};
