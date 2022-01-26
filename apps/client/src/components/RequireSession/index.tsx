import { LoginPage } from '@decipad/ui';
import { signIn, useSession } from 'next-auth/client';
import { FC, ReactNode } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { SECRET_URL_PARAM } from '../../lib/secret';

interface RequireSessionProps {
  readonly allowSecret?: boolean;

  readonly children: ReactNode;
}

export function RequireSession({
  allowSecret = false,
  children,
}: RequireSessionProps): ReturnType<FC> {
  const history = useHistory();
  const [session, sessionLoading] = useSession();

  const { search } = useLocation();
  const secret = new URLSearchParams(search).get(SECRET_URL_PARAM);

  if (session || (allowSecret && secret)) {
    return <>{children}</>;
  }

  if (sessionLoading) {
    return <>Loading...</>;
  }

  return (
    <LoginPage
      onSubmit={(email) => {
        signIn('email', { email, redirect: false });
        history.push('/verifyEmail');
      }}
    />
  );
}
