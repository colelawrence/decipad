import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { Analytics, AnalyticsBrowser } from '@segment/analytics-next';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';

const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
let analyticsInstance: Analytics | undefined;
let analyticsInitialized = false;
const loadAnalytics = async (): Promise<Analytics | void> => {
  if (!analyticsInitialized) {
    analyticsInitialized = true;
    if (!writeKey) {
      console.info('No analytics write key, skipping analytics initialization');
      return;
    }
    [analyticsInstance] = await AnalyticsBrowser.load({ writeKey });
  }
  return analyticsInstance;
};

const useAnalytics = (): Analytics | void => {
  const [analytics, setAnalytics] = useState<Analytics | void>();

  useEffect(() => {
    (async () => {
      setAnalytics(await loadAnalytics());
    })();
  }, []);

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
