/* eslint-disable no-console */
import type { HandleClientEventArgs } from '@decipad/client-events';
import { ClientEventsContext, getAnalytics } from '@decipad/client-events';
import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import ReactGA from 'react-ga';

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
      session.user.id &&
      session.user.email &&
      (session.user.id !== userId || session.user.email !== userEmail)
    ) {
      setUserId(session.user.id);
      setUserEmail(session.user.email);
      console.debug('analytics: identifying user with id', userId);
      analytics.then(({ identify }) => {
        identify(userId, {
          email: userEmail,
        });
      });
    }
  }, [analytics, session, userId, userEmail]);

  useEffect(() => {
    if (session?.user?.id) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    }
  }, [session?.user?.email, session?.user?.id]);

  return <>{children}</>;
};

const ClientEventsAnalytics: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const handleClientEvent = async (clientEvent: HandleClientEventArgs) => {
    const [analytics] = await getAnalytics();
    if (!analytics) {
      return;
    }
    if ('segmentEvent' in clientEvent) {
      const { segmentEvent } = clientEvent;
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

    if ('gaEvent' in clientEvent) {
      ReactGA.event(clientEvent.gaEvent);
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
