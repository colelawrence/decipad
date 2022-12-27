/* eslint-disable no-console */
import {
  ClientEvent,
  ClientEventsContext,
  getAnalytics,
} from '@decipad/client-events';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';

const IdentifyUserAnalytics: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const analytics = getAnalytics();
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

  useEffect(() => {
    if (session?.user.id) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    }
  }, [session?.user.email, session?.user.id]);

  return <>{children}</>;
};

const ClientEventsAnalytics: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const analytics = getAnalytics();

  const handleClientEvent = async (clientEvent: ClientEvent) => {
    if (!analytics) {
      return;
    }
    switch (clientEvent.type) {
      case 'page': {
        await analytics.page(clientEvent.category);
        break;
      }
      case 'action': {
        await analytics.track(clientEvent.action, clientEvent.props);
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
