import { Landing } from '@decipad/ui';
import { Session } from 'next-auth';

export function RequireSession({
  session,
  children,
}: {
  session: Session | null;
  children: JSX.Element;
}) {
  if (!session) {
    // TODO: we need a login screen. For now, Landing will do.
    return <Landing />;
  }
  return children;
}
