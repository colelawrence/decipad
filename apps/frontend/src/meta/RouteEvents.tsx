import { analytics, PageEvent } from '@decipad/client-events';
import { useSession } from 'next-auth/react';
import type { ReactNode, FC } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hasUpdate } from './providers/UpdatesProvider';

interface RouteEventsProps {
  children: ReactNode;
  category: PageEvent['category'];
}

export function RouteEvents({
  children,
  category,
}: RouteEventsProps): ReturnType<FC> {
  const { pathname: url } = useLocation();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (session?.user == null) {
      return;
    }

    analytics.identify(session.user.id, {
      email: session.user.email!,
    });
  }, [session]);

  useEffect(() => {
    // reload on location changes
    if (hasUpdate() && status === 'authenticated') {
      global.location.reload();
    }
  }, [status, url]);

  useEffect(() => {
    analytics.track({ type: 'page', category, url });
  }, [category, url]);

  return <>{children}</>;
}
