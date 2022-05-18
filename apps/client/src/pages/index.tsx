/* eslint-disable no-underscore-dangle */
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { GlobalStyles, theme, ToastDisplay } from '@decipad/ui';
import { Provider as AuthProvider, useSession } from 'next-auth/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import { ClientEventsAnalytics } from '../components/ClientEventsAnalytics';
import { IdentifyUserAnalytics } from '../components/IdentifyUserAnalytics';
import { useApollo } from '../lib/apolloClient';
import { Router } from '../routes';

require('../suppressSomeReactWarnings');

const inBrowser = typeof window !== 'undefined';

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

const Index = ({ pageProps = {} }: AppProps): ReturnType<FC> => {
  const apolloClient = useApollo(pageProps);
  const [session] = useSession();

  return (
    <>
      <Head>
        <link
          href="/assets/favicon.png"
          rel="shortcut icon"
          type="image/x-icon"
        />
        <link href="/assets/favicon.png" rel="apple-touch-icon" />
        {process.env.NEXT_PUBLIC_HOTJAR_SITE_ID && (
          <script
            async
            src={`https://static.hotjar.com/c/hotjar-${process.env.NEXT_PUBLIC_HOTJAR_SITE_ID}.js?sv=6`}
          />
        )}
      </Head>
      <ClientEventsAnalytics>
        <ToastDisplay>
          <DndProvider backend={HTML5Backend}>
            <AuthProvider session={session ?? undefined}>
              <IdentifyUserAnalytics>
                <ApolloProvider client={apolloClient}>
                  <GlobalStyles>
                    <ChakraProvider theme={theme}>
                      <BrowserRouter>
                        <Router />
                      </BrowserRouter>
                    </ChakraProvider>
                  </GlobalStyles>
                </ApolloProvider>
              </IdentifyUserAnalytics>
            </AuthProvider>
          </DndProvider>
        </ToastDisplay>
      </ClientEventsAnalytics>
    </>
  );
};

export default Index;
