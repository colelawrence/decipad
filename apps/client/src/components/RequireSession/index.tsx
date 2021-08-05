import { Landing } from '@decipad/ui';
import { Session } from 'next-auth';
import { FC } from 'react';

export function RequireSession({
  session,
  children,
}: {
  session: Session | null;
  children: JSX.Element;
}): ReturnType<FC> {
  if (!session) {
    // TODO: we need a login screen. For now, Landing will do.
    return <Landing />;
  }
  return children;
}
