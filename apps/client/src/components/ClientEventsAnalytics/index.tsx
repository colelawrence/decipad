import { FC, ReactNode } from 'react';
import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { useAnalytics } from '../../lib/useAnalytics';

// TODO test

export function ClientEventsAnalytics({
  children,
}: {
  children: ReactNode;
}): ReturnType<FC> {
  const analytics = useAnalytics();

  const handleClientEvent = (clientEvent: ClientEvent) => {
    if (!analytics) {
      return;
    }
    switch (clientEvent.type) {
      case 'page': {
        analytics.page(clientEvent.category);
        break;
      }
      case 'action': {
        analytics.track(clientEvent.action, clientEvent.props);
      }
    }
  };

  return (
    <ClientEventsContext.Provider value={handleClientEvent}>
      {children}
    </ClientEventsContext.Provider>
  );
}
