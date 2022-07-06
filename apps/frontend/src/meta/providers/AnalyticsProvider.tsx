/* eslint-disable no-console */
import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';

export const useAnalytics = (): AnalyticsBrowser | undefined => {
  const [analytics] = useState<AnalyticsBrowser | undefined>(() => {
    const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
    if (writeKey) {
      return AnalyticsBrowser.load({ writeKey });
    }
    return undefined;
  });
  return analytics;
};

const IdentifyUserAnalytics: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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
      console.debug('analytics: identifying user with id', session.user.id);
      analytics.identify(session.user.id, {
        email: session.user.email,
      });
    }
  }, [analytics, session, userId, userEmail]);

  return <>{children}</>;
};

const ClientEventsAnalytics: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <IdentifyUserAnalytics>
      <ClientEventsAnalytics>{children}</ClientEventsAnalytics>
    </IdentifyUserAnalytics>
  );
};
