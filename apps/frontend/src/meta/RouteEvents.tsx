import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { useSession } from 'next-auth/react';
import { ReactNode, FC, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hasUpdate } from './providers/UpdatesProvider';

type PageEvent = ClientEvent & { type: 'page' };
type PlainPageEvent = PageEvent;

interface RouteEventsProps {
  children: ReactNode;
  category: PlainPageEvent['category'];
}

export function RouteEvents({
  children,
  category,
}: RouteEventsProps): ReturnType<FC> {
  const clientEvent = useContext(ClientEventsContext);
  const { pathname: url } = useLocation();
  const { status } = useSession();

  useEffect(() => {
    // reload on location changes
    if (hasUpdate() && status === 'authenticated') {
      global.location.reload();
    }
  }, [status, url]);

  useEffect(() => {
    clientEvent({ type: 'page', category, url });
  }, [clientEvent, category, url]);

  return <>{children}</>;
}
