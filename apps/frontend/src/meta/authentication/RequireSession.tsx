import { useSession } from 'next-auth/react';
import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SECRET_URL_PARAM } from '@decipad/routing';
import { Loading } from '../Loading';
import { Login } from './Login';

interface RequireSessionProps {
  readonly allowSecret?: boolean;

  readonly children: ReactNode;
}

export const RequireSession: FC<RequireSessionProps> = ({
  allowSecret = false,
  children,
}: RequireSessionProps): ReturnType<FC> => {
  const { status, data: session } = useSession();

  const { search } = useLocation();
  const secret = new URLSearchParams(search).get(SECRET_URL_PARAM);

  if (session || (allowSecret && secret)) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return <Loading />;
  }

  return <Login />;
};
