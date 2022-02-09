import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { FC, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type PageEvent = ClientEvent & { type: 'page' };
type PlainPageEvent = PageEvent & { props: undefined };

interface RouteEventsProps {
  children: JSX.Element;
  category: PlainPageEvent['category'];
}

export function RouteEvents({
  children,
  category,
}: RouteEventsProps): ReturnType<FC> {
  const clientEvent = useContext(ClientEventsContext);
  const location = useLocation();

  useEffect(() => {
    clientEvent({ type: 'page', category, url: location.pathname });
  }, [clientEvent, category, location]);

  return children;
}
