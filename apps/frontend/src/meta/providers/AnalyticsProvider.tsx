/* eslint-disable no-console */
import { useCallback } from 'react';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { HandleClientEventArgs } from '@decipad/client-events';
import { ClientEventsContext, getAnalytics } from '@decipad/client-events';
import { env } from '@decipad/client-env';

const ClientEventsAnalytics: FC<PropsWithChildren> = ({ children }) => {
  const handleClientEvent = useCallback(
    async (clientEvent: HandleClientEventArgs) => {
      await getAnalytics().then(async (analytics) => {
        if (!analytics) {
          return;
        }
        console.log('analytics', analytics);
        if ('segmentEvent' in clientEvent) {
          console.log('segmentEvent', clientEvent.segmentEvent);
          const { segmentEvent } = clientEvent;
          if (segmentEvent) {
            switch (segmentEvent.type) {
              case 'page': {
                await analytics.page(segmentEvent.category);
                break;
              }
              case 'action': {
                await analytics.track(segmentEvent.action, segmentEvent.props);
              }
            }
          }
        }
      });

      if (clientEvent.gaEvent) {
        const ReactGA = await import('react-ga');
        ReactGA.initialize(env.VITE_GOOGLE_ANALYTICS_ID);
        ReactGA.event(clientEvent.gaEvent);
      }
    },
    []
  );

  return (
    <ClientEventsContext.Provider value={handleClientEvent}>
      {children}
    </ClientEventsContext.Provider>
  );
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <ClientEventsAnalytics>{children}</ClientEventsAnalytics>;
};
