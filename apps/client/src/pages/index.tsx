/* eslint-disable no-underscore-dangle */
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { GlobalStyles, theme } from '@decipad/ui';
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
import { useApollo } from '../lib/apolloClient';
import { Router } from '../routes';

const inBrowser = typeof window !== 'undefined';

const history = inBrowser ? createBrowserHistory() : null;
const sentryDSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const usingSentry = !!sentryDSN;

if (history && usingSentry) {
  init({
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    dsn: sentryDSN,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: reactRouterV5Instrumentation(history),
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
  });
}

if (inBrowser && process.env.NEXT_PUBLIC_HOTJAR_SITE_ID) {
  // HOTJAR POLLUTION
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)._hjSettings = {
    hjid: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
    hjsv: 6,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).hj = (...args: unknown[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((window as any).hj.q = (window as any).hj.q || []).push(args);
  };
}

export default withProfiler(Index);

function Index({ pageProps = {} }) {
  const apolloClient = useApollo(pageProps);
  const [session] = useSession();

  if (usingSentry && session?.user) {
    setUser({
      id: session.user.id,
    });
  }

  return (
    <>
      <Head>
        <title>Decipad</title>
        <link
          href="/assets/decipad-logo-mark-one-color-rgb-864px@72ppi.png"
          rel="shortcut icon"
          type="image/x-icon"
        />
        <link
          href="/assets/decipad-logo-mark-one-color-rgb-864px@72ppi.png"
          rel="apple-touch-icon"
        />
        {process.env.NEXT_PUBLIC_HOTJAR_SITE_ID && (
          <script
            async
            src={`https://static.hotjar.com/c/hotjar-${process.env.NEXT_PUBLIC_HOTJAR_SITE_ID}.js?sv=6`}
          />
        )}
      </Head>
      <ToastProvider autoDismiss placement="bottom-right">
        <AuthProvider session={session ?? undefined}>
          <ApolloProvider client={apolloClient}>
            <GlobalStyles>
              <ChakraProvider theme={theme}>
                <BrowserRouter>
                  <Router />
                </BrowserRouter>
              </ChakraProvider>
            </GlobalStyles>
          </ApolloProvider>
        </AuthProvider>
      </ToastProvider>
    </>
  );
}
