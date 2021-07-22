import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { DocSyncProvider } from '@decipad/editor';
import { LoadingSpinnerPage, GlobalStyles, theme } from '@decipad/ui';
import {
  init,
  reactRouterV5Instrumentation,
  setUser,
  withProfiler,
} from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { createBrowserHistory } from 'history';
import { Provider as AuthProvider, useSession } from 'next-auth/client';
import Head from 'next/head';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { GlobalErrorHandler } from '../components/GlobalErrorHandler';
import { useApollo } from '../lib/apolloClient';
import { Router } from '../routes';

const inBrowser = typeof window !== 'undefined';

const history = inBrowser ? createBrowserHistory() : null;
const sentryDSN = process.env.NEXT_SENTRY_DSN;
const usingSentry = !!sentryDSN;

if (history && usingSentry) {
  init({
    dsn: sentryDSN,
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

  if (usingSentry && session?.user) {
    setUser({
      id: session.user.id,
    });
  }

  return (
    <>
      <Head>
        <title>Decipad</title>
      </Head>
      <GlobalErrorHandler>
        <ToastProvider autoDismiss placement="bottom-left">
          <AuthProvider session={session ?? undefined}>
            <ApolloProvider client={apolloClient}>
              <GlobalStyles>
                <ChakraProvider theme={theme}>
                  <DocSyncProvider>
                    <BrowserRouter>
                      <Router session={session} />
                    </BrowserRouter>
                  </DocSyncProvider>
                </ChakraProvider>
              </GlobalStyles>
            </ApolloProvider>
          </AuthProvider>
        </ToastProvider>
      </GlobalErrorHandler>
    </>
  );
}
