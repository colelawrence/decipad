import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { ReactNode, FC, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
  const url = useLocation().pathname;

  useEffect(() => {
    clientEvent({ type: 'page', category, url });
  }, [clientEvent, category, url]);

  return <>{children}</>;
}
