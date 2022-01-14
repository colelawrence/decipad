import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { FC, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteAnalyticsProps {
  children: JSX.Element;
  category: (ClientEvent & { type: 'page' })['category'];
}

export function RouteEvents({
  children,
  category,
}: RouteAnalyticsProps): ReturnType<FC> {
  const clientEvent = useContext(ClientEventsContext);
  const location = useLocation();

  useEffect(() => {
    clientEvent({ type: 'page', category, url: location.pathname });
  }, [clientEvent, category, location]);

  return children;
}
