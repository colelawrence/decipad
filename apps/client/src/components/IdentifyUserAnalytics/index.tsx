import { FC, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/client';
import { useAnalytics } from '../../lib/useAnalytics';

export function IdentifyUserAnalytics({
  children,
}: {
  children: ReactNode;
}): ReturnType<FC> {
  const analytics = useAnalytics();
  const [session] = useSession();
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    if (analytics && session?.user && session.user.id !== userId) {
      setUserId(session.user.id);
      analytics.identify(session.user.id);
    }
  }, [analytics, session, userId]);

  return <>{children}</>;
}
