import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { RuntimeProvider } from '@decipad/editor';
import { theme } from '@decipad/ui';
import { useSession, Provider as AuthProvider } from 'next-auth/client';
import { BrowserRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Head from 'next/head';
import { LoadingSpinnerPage } from '@decipad/ui';
import {
  setUser,
  init,
  withProfiler,
  reactRouterV5Instrumentation,
} from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { useApollo } from '../lib/apolloClient';
import { Router } from '../components/Router';
import { GlobalErrorHandler } from '../components/GlobalErrorHandler';
import { ToastProvider } from 'react-toast-notifications';

const inBrowser = typeof window !== 'undefined';

const history = inBrowser ? createBrowserHistory() : null;

if (history) {
  init({
    dsn: 'https://95cb017d05284b08b7b24b6dfe258962@o592547.ingest.sentry.io/5741035',
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: reactRouterV5Instrumentation(history),
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

export default withProfiler(Index);

function Index({ pageProps = {} }) {
  const apolloClient = useApollo(pageProps);
  const [session, loading] = useSession();

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (session?.user) {
    setUser({
      id: (session.user as { id: string }).id,
      email: session.user.email!,
      username: session.user.name!,
    });
  }

  return (
    <div>
      <Head>
        <title>Decipad</title>
      </Head>
      <GlobalErrorHandler>
        <ToastProvider autoDismiss placement="bottom-left">
          <AuthProvider session={session!}>
            <ApolloProvider client={apolloClient}>
              <ChakraProvider resetCSS theme={theme}>
                <RuntimeProvider>
                  <BrowserRouter>
                    <Router session={session} />
                  </BrowserRouter>
                </RuntimeProvider>
              </ChakraProvider>
            </ApolloProvider>
          </AuthProvider>
        </ToastProvider>
      </GlobalErrorHandler>
    </div>
  );
}
