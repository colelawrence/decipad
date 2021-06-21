import { ReactNode } from 'react';
import { Session } from 'next-auth';
import { Landing } from '@decipad/ui';

export function RequireSession({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  if (!session) {
    // TODO: we need a login screen. For now, Landing will do.
    return <Landing />;
  }
  return <>{children}</>;
}
