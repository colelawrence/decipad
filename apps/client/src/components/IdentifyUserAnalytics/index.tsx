import { FC, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useAnalytics } from '../../lib/useAnalytics';

export function IdentifyUserAnalytics({
  children,
}: {
  children: ReactNode;
}): ReturnType<FC> {
  const analytics = useAnalytics();
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    if (
      analytics &&
      session?.user &&
      (session.user.id !== userId || session.user.email !== userEmail)
    ) {
      setUserId(session.user.id);
      setUserEmail(session.user.email);
      analytics.identify(session.user.id, {
        email: session.user.email,
      });
    }
  }, [analytics, session, userId, userEmail]);

  return <>{children}</>;
}
