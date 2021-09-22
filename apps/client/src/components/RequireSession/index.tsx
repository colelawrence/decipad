import { Landing } from '@decipad/ui';
import { useSession } from 'next-auth/client';
import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SECRET_URL_PARAM } from '../../lib/secret';

interface RequireSessionProps {
  readonly allowSecret?: boolean;

  readonly children: ReactNode;
}

export function RequireSession({
  allowSecret = false,
  children,
}: RequireSessionProps): ReturnType<FC> {
  const [session, sessionLoading] = useSession();

  const { search } = useLocation();
  const secret = new URLSearchParams(search).get(SECRET_URL_PARAM);

  if (session || (allowSecret && secret)) {
    return <>{children}</>;
  }

  if (sessionLoading) {
    return <>Loading...</>;
  }

  // TODO: we need a login screen. For now, Landing will do.
  return <Landing />;
}
