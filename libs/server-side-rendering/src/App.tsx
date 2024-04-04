/* eslint-disable import/no-extraneous-dependencies */
import type { EmotionCache } from '@emotion/react';
import { CacheProvider } from '@emotion/react';
import type { FC } from 'react';
import { StaticRouter } from 'react-router-dom/server';
import type { Client } from 'urql';
import { Provider as GraphqlProvider } from 'urql';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
// eslint-disable-next-line import/no-relative-packages
import AppLoader from '../../../apps/frontend/src/AppLoader';

interface AppProps {
  location: string;
  urlBase: string;
  client: Client;
  emotionCache: EmotionCache;
  session: Session;
}

export const App: FC<AppProps> = ({
  location,
  client,
  emotionCache,
  session,
}) => {
  return (
    <SessionProvider session={session}>
      <StaticRouter location={location}>
        <GraphqlProvider value={client}>
          <CacheProvider value={emotionCache}>
            <AppLoader />
          </CacheProvider>
        </GraphqlProvider>
      </StaticRouter>
    </SessionProvider>
  );
};
